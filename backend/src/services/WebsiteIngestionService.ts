import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../prisma/index.js";
import { RFPSource, RFPStatus, TriggerType } from "@prisma/client";
import { WorkflowOrchestrator } from "../orchestration/WorkflowOrchestrator.js";
import { logger } from "../utils/logger.js";
import { RFP_SOURCES } from "../config/rfpSources.js";

export class WebsiteIngestionService {
  async scanAllWebsites() {
    for (const source of RFP_SOURCES) {
      try {
        await this.scanWebsite(source);
      } catch (err) {
        logger.error("Website scan failed", {
          source: source.name,
          error: (err as Error).message,
        });
      }
    }
  }

  private async scanWebsite(source: any) {
    logger.info("🌐 Scanning RFP website", { source: source.name });

    const response = await axios.get(source.url);
    const $ = cheerio.load(response.data);

    // ⚠️ Selector example (website specific hota hai)
    // @ts-ignore
    $(".tender-item").each(async (_, el) => {
      const title = $(el).find(".tender-title").text().trim();
      const deadlineText = $(el).find(".tender-deadline").text().trim();
      const deadline = new Date(deadlineText);

      if (!title || isNaN(deadline.getTime())) return;

      const daysLeft =
        (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

      // ❌ Skip far future tenders
      if (daysLeft > 90) return;

      // ❌ Duplicate check
      const exists = await prisma.rFP.findFirst({
        where: { title },
      });
      if (exists) return;

      // ✅ Create RFP
      const rfp = await prisma.rFP.create({
        data: {
          rfpNumber: `WEB-${Date.now()}`,
          title,
          issuer: source.name,
          industry: "Industrial",
          submissionDeadline: deadline,
          source: RFPSource.WEBSITE,
          status: RFPStatus.NEW,
        },
      });

      logger.info("✅ RFP created from website", {
        rfpId: rfp.id,
        title,
      });

      // 🔥 OPTIONAL: auto start workflow
      await WorkflowOrchestrator.getInstance().startWorkflow(
        rfp.id,
        TriggerType.AUTO_WEBSITE_INGESTION
      );
    });
  }
}
