import { Request, Response } from 'express';
export declare class RFPController {
    create(req: Request, res: Response): Promise<void>;
    list(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    uploadDocument(req: Request, res: Response): Promise<void>;
    startWorkflow(req: Request, res: Response): Promise<void>;
    getWorkflowStatus(req: Request, res: Response): Promise<void>;
    getTechnicalAnalysis(req: Request, res: Response): Promise<void>;
    getPricingAnalysis(req: Request, res: Response): Promise<void>;
    getResponse(req: Request, res: Response): Promise<void>;
}
