import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import { prisma } from "../prisma/index.js";
import { RFPSource, RFPStatus } from "@prisma/client";
import { logger } from "../utils/logger.js";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class EmailIngestionService {
  async scanInbox() {
    logger.info("📨 Scanning email inbox for RFPs...");

    const config = {
      imap: {
        user: process.env.EMAIL_USER!,
        password: process.env.EMAIL_PASS!,
        host: process.env.EMAIL_HOST!,
        port: Number(process.env.EMAIL_PORT),
        tls: true,
        tlsOptions: {
          rejectUnauthorized: false, // 🔥 fixes self-signed cert issue
        },
        authTimeout: 10000,
      },
    };

    let connection;

    try {
      connection = await imaps.connect(config);
      await connection.openBox("INBOX");

      const messages = await connection.search(["UNSEEN"], {
        bodies: [""],
      });

      logger.info(`📧 Total unseen emails found: ${messages.length}`);

      for (const item of messages) {
        try {
          const mail = await simpleParser(item.parts[0].body);
          const subject = mail.subject ?? "";
          const from = mail.from?.text ?? "Unknown";

          // 🎯 STRONG ENTERPRISE FILTER
          const isValidRFP =
            /\b(RFP|RFQ|Tender|Bid)\b/i.test(subject) &&
            /(Procurement|Supply|Purchase|Quotation)/i.test(subject);

          if (!isValidRFP) {
            logger.debug(`⏭️ Skipping non-RFP email: ${subject}`);
            continue;
          }

          // ❌ prevent duplicates
          const exists = await prisma.rFP.findFirst({
            where: { title: subject },
          });
          if (exists) {
            logger.info(`⚠️ Duplicate RFP skipped: ${subject}`);
            continue;
          }

          // ✅ create RFP
          const rfp = await prisma.rFP.create({
            data: {
              rfpNumber: `EMAIL-${Date.now()}`,
              title: subject,
              description: mail.text?.slice(0, 3000) ?? null,
              issuer: from,
              industry: "Industrial",
              submissionDeadline: new Date(Date.now() + 30 * 86400000), // +30 days
              source: RFPSource.EMAIL,
              status: RFPStatus.NEW, // 🚫 workflow NOT auto-started
            },
          });

          logger.info("✅ RFP created from email", {
            rfpId: rfp.id,
            title: rfp.title,
          });

          // ⏱️ RATE LIMIT (Gemini safe)
          await sleep(15000); // 15 sec gap

        } catch (emailErr) {
          logger.error("❌ Failed to process email", {
            error: (emailErr as Error).message,
          });
        }
      }

    } catch (err) {
      logger.error("❌ Email ingestion failed", {
        error: (err as Error).message,
      });
    } finally {
      if (connection) {
        await connection.end();
        logger.info("📪 Email connection closed");
      }
    }
  }
}
