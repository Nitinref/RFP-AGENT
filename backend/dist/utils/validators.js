import { z } from 'zod';
import { ValidationError } from './errors.js';
const rfpCreateSchema = z.object({
    rfpNumber: z.string().min(1),
    title: z.string().min(1),
    issuer: z.string().min(1),
    industry: z.string().min(1),
    source: z.enum(['EMAIL', 'PORTAL', 'UPLOAD', 'API', 'MANUAL']),
    sourceUrl: z.string().url().optional(),
    submissionDeadline: z.string().datetime(),
    clarificationDeadline: z.string().datetime().optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
    estimatedValue: z.number().optional(),
    currency: z.string().optional(),
    region: z.string().optional(),
    tags: z.array(z.string()).optional(),
});
export const validateRFPCreate = (req, res, next) => {
    try {
        rfpCreateSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            // @ts-ignore
            next(new ValidationError(error.errors[0].message));
        }
        else {
            next(error);
        }
    }
};
//# sourceMappingURL=validators.js.map