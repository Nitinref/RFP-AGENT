import { Request, Response } from 'express';
export declare class WorkflowController {
    getStatus(req: Request, res: Response): Promise<void>;
    retry(req: Request, res: Response): Promise<void>;
    getActivities(req: Request, res: Response): Promise<void>;
    getDecisions(req: Request, res: Response): Promise<void>;
}
