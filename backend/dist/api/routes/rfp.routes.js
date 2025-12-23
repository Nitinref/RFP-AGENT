import { Router } from 'express';
import multer from 'multer';
import { RFPController } from '../controllers/RFPController.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { authenticate } from '../../middleware/auth.js';
import { validateRFPCreate } from '../../utils/validators.js';
const router = Router();
const controller = new RFPController();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.docx', '.txt', '.doc'];
        const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error(`File type ${ext} not allowed`));
        }
    },
});
router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use(authenticate);
router.post('/', validateRFPCreate, asyncHandler(controller.create));
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.delete));
router.post('/:id/document', upload.single('file'), asyncHandler(controller.uploadDocument));
router.post('/:id/workflow', asyncHandler(controller.startWorkflow));
router.get('/:id/workflow/status', asyncHandler(controller.getWorkflowStatus));
router.get('/:id/technical-analysis', asyncHandler(controller.getTechnicalAnalysis));
router.get('/:id/pricing-analysis', asyncHandler(controller.getPricingAnalysis));
router.get('/:id/response', asyncHandler(controller.getResponse));
router.get('/:id/report', controller.getReport.bind(controller));
// auth baad me
router.use(authenticate);
router.get('/:id/report', asyncHandler(controller.getReport));
router.get('/:id/report/pdf', asyncHandler(controller.downloadReportPDF));
export default router;
//# sourceMappingURL=rfp.routes.js.map