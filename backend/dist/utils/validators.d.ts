import { Request, Response, NextFunction } from 'express';
export declare const validateRFPCreate: (req: Request, res: Response, next: NextFunction) => void;
export interface RFPCreateInput {
    rfpNumber: string;
    title: string;
    issuer: string;
    industry: string;
    source: 'EMAIL' | 'PORTAL' | 'UPLOAD' | 'API' | 'MANUAL';
    sourceUrl?: string;
    submissionDeadline: string;
    clarificationDeadline?: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedValue?: number;
    currency?: string;
    region?: string;
    tags?: string[];
}
