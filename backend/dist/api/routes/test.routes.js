import { Router } from "express";
import { EmailIngestionService } from "../../services/EmailIngestionService.js";
const router = Router();
router.get("/scan-email", async (_, res) => {
    const service = new EmailIngestionService();
    await service.scanInbox();
    res.json({ success: true });
});
export default router;
//# sourceMappingURL=test.routes.js.map