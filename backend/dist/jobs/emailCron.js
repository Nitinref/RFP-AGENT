import cron from "node-cron";
import { EmailIngestionService } from "../services/EmailIngestionService.js";
const service = new EmailIngestionService();
cron.schedule("*/10 * * * *", async () => {
    console.log("📧 Scanning RFP inbox...");
    await service.scanInbox();
});
//# sourceMappingURL=emailCron.js.map