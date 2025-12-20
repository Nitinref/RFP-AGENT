import { Request, Response } from 'express';
import { WorkflowOrchestrator } from '../../orchestration/WorkflowOrchestrator.js';

const orchestrator = WorkflowOrchestrator.getInstance();

export class WorkflowController {
  async getStatus(req: Request, res: Response) {
    const { id } = req.params;
    const status = await orchestrator.getWorkflowStatus(id);

    res.json({
      success: true,
      data: status,
    });
  }

  async retry(req: Request, res: Response) {
    const { id } = req.params;
    const result = await orchestrator.retryWorkflow(id);

    res.json({
      success: true,
      data: result,
    });
  }

  async getActivities(req: Request, res: Response) {
    const { id } = req.params;
    const status = await orchestrator.getWorkflowStatus(id);

    res.json({
      success: true,
      data: status?.agentActivities || [],
    });
  }

  async getDecisions(req: Request, res: Response) {
    const { id } = req.params;
    const status = await orchestrator.getWorkflowStatus(id);

    res.json({
      success: true,
      data: status?.modelDecisions || [],
    });
  }
}