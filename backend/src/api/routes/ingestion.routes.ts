import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";

import { EmailIngestionService } from "../../services/EmailIngestionService.js";
import { WebsiteIngestionService } from "../../services/WebsiteIngestionService.js";
import { RealWebsiteIngestionService } from "../../services/RealWebsiteIngestionService.js";

const router = Router();

// ✅ Services
const emailService = new EmailIngestionService();
const websiteService = new WebsiteIngestionService();
const realWebsiteService = new RealWebsiteIngestionService();

// 🔐 Protect all ingestion routes
router.use(authenticate);

/**
 * 📧 EMAIL INGESTION
 * POST /api/ingestion/email
 */
router.post("/email", async (_req, res, next) => {
  try {
    console.log("🔥 EMAIL INGESTION TRIGGERED");
    await emailService.scanInbox();

    res.json({
      success: true,
      message: "Email ingestion scan completed",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 🌐 BASIC WEBSITE INGESTION (axios / cheerio)
 * POST /api/ingestion/website
 */
router.post("/website", async (_req, res, next) => {
  try {
    console.log("🔥 WEBSITE INGESTION TRIGGERED");
    await websiteService.scanAllWebsites();

    res.json({
      success: true,
      message: "Website RFP scan completed",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 🌐 REAL GeM INGESTION (Playwright)
 * POST /api/ingestion/website/gem
 */
router.post("/website/gem", async (_req, res, next) => {
  try {
    console.log("🔥 REAL GeM INGESTION TRIGGERED");
    await realWebsiteService.scanGeM();

    res.json({
      success: true,
      message: "GeM scan completed",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
