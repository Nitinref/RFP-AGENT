import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
declare const rfpCreateSchema: z.ZodObject<{
    rfpNumber: z.ZodString;
    title: z.ZodString;
    issuer: z.ZodString;
    industry: z.ZodString;
    source: z.ZodEnum<{
        EMAIL: "EMAIL";
        PORTAL: "PORTAL";
        UPLOAD: "UPLOAD";
        API: "API";
        MANUAL: "MANUAL";
    }>;
    sourceUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    submissionDeadline: z.ZodString;
    clarificationDeadline: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    priority: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>>>;
    estimatedValue: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    region: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    description: z.ZodOptional<z.ZodString>;
    requirements: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RFPCreateInput = z.infer<typeof rfpCreateSchema>;
export declare const validateRFPCreate: (req: Request, res: Response, next: NextFunction) => void;
export declare const prepareRFPData: (data: Partial<RFPCreateInput>) => RFPCreateInput;
export declare const sampleRFPCreateData: RFPCreateInput;
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    validatedData?: RFPCreateInput;
}
export declare const validateRFPDataSync: (data: any) => ValidationResult;
export {};
