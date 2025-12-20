import { Router } from 'express';
import { WorkflowController } from '../controllers/WorkflowController.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { authenticate } from '../../middleware/auth.js';
const router = Router();
const controller = new WorkflowController();
router.use(authenticate);
router.get('/:id', asyncHandler(controller.getStatus));
router.post('/:id/retry', asyncHandler(controller.retry));
router.get('/:id/activities', asyncHandler(controller.getActivities));
router.get('/:id/decisions', asyncHandler(controller.getDecisions));
export { router as workflowRoutes };
//# sourceMappingURL=workflow.routes.js.map