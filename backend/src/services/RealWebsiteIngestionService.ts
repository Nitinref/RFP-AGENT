import { chromium } from "playwright";
import { prisma } from "../prisma/index.js";
import { WorkflowOrchestrator } from "../orchestration/WorkflowOrchestrator.js";
import { RFPSource, RFPStatus, TriggerType } from "@prisma/client";
import { logger } from "../utils/logger.js";

export class RealWebsiteIngestionService {
  async scanGeM() {
    logger.info("🌐 Launching browser for GeM");

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://bidplus.gem.gov.in/all-bids", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // 🔥 WAIT for tender cards
    await page.waitForSelector(".card", { timeout: 60000 });

    const tenders = await page.$$eval(".card", (cards: any[]) =>
      cards.slice(0, 5).map(card => ({
        title: card.querySelector(".bid_no")?.textContent?.trim(),
        deadline: card.querySelector(".end-date")?.textContent?.trim(),
      }))
    );

    logger.info(`📄 Tenders found: ${tenders.length}`);

    for (const tender of tenders) {
      if (!tender.title) continue;

      const exists = await prisma.rFP.findFirst({
        where: { title: tender.title },
      });
      if (exists) continue;

      const rfp = await prisma.rFP.create({
        data: {
          rfpNumber: `GEM-${Date.now()}`,
          title: tender.title,
          issuer: "GeM Portal",
          industry: "Government Procurement",
          submissionDeadline: new Date(Date.now() + 15 * 86400000),
          source: RFPSource.WEBSITE,
          status: RFPStatus.NEW,
        },
      });

      logger.info("✅ RFP created from GeM", { rfpId: rfp.id });

      await WorkflowOrchestrator.getInstance().startWorkflow(
        rfp.id,
        TriggerType.AUTO_WEBSITE_INGESTION
      );
    }

    await browser.close();
  }
}
