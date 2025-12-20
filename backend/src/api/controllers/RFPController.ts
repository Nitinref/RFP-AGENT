import { Request, Response } from 'express';
import { RFPService } from '../../services/RFPService.js';
import { DocumentService } from '../../services/DocumentService.js';
import { WorkflowOrchestrator } from '../../orchestration/WorkflowOrchestrator.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { TriggerType } from '@prisma/client';
const rfpService = new RFPService();
const documentService = new DocumentService();
const orchestrator = WorkflowOrchestrator.getInstance();

export class RFPController {
  async create(req: Request, res: Response) {
    const data = req.body;
    const rfp = await rfpService.createRFP(data);

    res.status(201).json({
      success: true,
      data: rfp,
    });
  }

  async list(req: Request, res: Response) {
    const { status, priority, industry, limit, offset } = req.query;

    const result = await rfpService.listRFPs({
      status: status as string,
      priority: priority as string,
      industry: industry as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json({
      success: true,
      data: result.rfps,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const rfp = await rfpService.getRFPById(id);

    res.json({
      success: true,
      data: rfp,
    });
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    const rfp = await rfpService.updateRFPStatus(id, data.status);

    res.json({
      success: true,
      data: rfp,
    });
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await rfpService.deleteRFP(id);

    res.json({
      success: true,
      message: 'RFP deleted successfully',
    });
  }

  async uploadDocument(req: Request, res: Response) {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      throw new ValidationError('No file uploaded');
    }

    const result = await documentService.processDocument(id, file);

    res.json({
      success: true,
      data: result,
    });
  }

  async startWorkflow(req: Request, res: Response) {
    const { id } = req.params;
    const { triggerType, triggerReason } = req.body;

    const result = await orchestrator.startWorkflow(
      id,
      (triggerType as TriggerType) || TriggerType.MANUAL,
      triggerReason,
      (req as any).user?.id
    );

    res.json({
      success: true,
      data: result,
    });
  }

  async getWorkflowStatus(req: Request, res: Response) {
    const { id } = req.params;

    const rfp = await rfpService.getRFPById(id);
    
    if (!rfp.workflowRuns || rfp.workflowRuns.length === 0) {
      throw new NotFoundError('No workflow runs found');
    }

    const latestRun = rfp.workflowRuns[0];
    const status = await orchestrator.getWorkflowStatus(latestRun.id);

    res.json({
      success: true,
      data: status,
    });
  }

  async getTechnicalAnalysis(req: Request, res: Response) {
    const { id } = req.params;
    const rfp = await rfpService.getRFPById(id);

    if (!rfp.technicalAnalyses || rfp.technicalAnalyses.length === 0) {
      throw new NotFoundError('No technical analysis found');
    }

    res.json({
      success: true,
      data: rfp.technicalAnalyses[0],
    });
  }

  async getPricingAnalysis(req: Request, res: Response) {
    const { id } = req.params;
    const rfp = await rfpService.getRFPById(id);

    if (!rfp.pricingAnalyses || rfp.pricingAnalyses.length === 0) {
      throw new NotFoundError('No pricing analysis found');
    }

    res.json({
      success: true,
      data: rfp.pricingAnalyses[0],
    });
  }

  async getResponse(req: Request, res: Response) {
    const { id } = req.params;
    const rfp = await rfpService.getRFPById(id);

    if (!rfp.responses || rfp.responses.length === 0) {
      throw new NotFoundError('No response found');
    }

    res.json({
      success: true,
      data: rfp.responses[0],
    });
  }
}
