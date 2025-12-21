import { z } from 'zod';
import { ValidationError } from './errors.js';
// Define the schema
const rfpCreateSchema = z.object({
    rfpNumber: z.string().min(1, { message: "RFP number is required" }),
    title: z.string().min(1, { message: "Title is required" }),
    issuer: z.string().min(1, { message: "Issuer is required" }),
    industry: z.string().min(1, { message: "Industry is required" }),
    source: z.enum(['EMAIL', 'PORTAL', 'UPLOAD', 'API', 'MANUAL']),
    sourceUrl: z.string().url({ message: "Invalid URL format" }).optional().or(z.literal('')),
    submissionDeadline: z.string().datetime({
        message: "Invalid date format. Use ISO format like: 2024-12-31T23:59:59.000Z"
    }),
    clarificationDeadline: z.string().datetime({
        message: "Invalid clarification date format"
    }).optional().or(z.literal('')),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().default('MEDIUM'),
    estimatedValue: z.number().min(0, { message: "Estimated value must be positive" }).optional(),
    currency: z.string().length(3, { message: "Currency must be 3 characters (e.g., USD)" }).optional().default('USD'),
    region: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    description: z.string().optional(),
    requirements: z.string().optional(),
});
// Main validation middleware
export const validateRFPCreate = (req, res, next) => {
    try {
        // Parse and validate the request body
        const validatedData = rfpCreateSchema.parse(req.body);
        // Store validated data in request object for later use
        req.validatedBody = validatedData;
        // Continue to next middleware/controller
        next();
    }
    catch (error) {
        handleValidationError(error, next);
    }
};
// Error handling function
const handleValidationError = (error, next) => {
    if (error instanceof z.ZodError) {
        // Get the first validation error
        const firstError = getFirstValidationError(error);
        if (firstError) {
            next(new ValidationError(firstError));
        }
        else {
            next(new ValidationError('Validation failed: Invalid data format'));
        }
    }
    else if (error instanceof Error) {
        // Handle other Error types
        next(new ValidationError(error.message));
    }
    else {
        // Handle unknown error types
        next(new ValidationError('An unknown validation error occurred'));
    }
};
// Helper to extract first error message
const getFirstValidationError = (zodError) => {
    // @ts-ignore
    if (zodError.errors && zodError.errors.length > 0) {
        // @ts-ignore
        const firstError = zodError.errors[0];
        // Build a user-friendly error message
        const field = firstError.path.length > 0
            ? `Field "${firstError.path.join('.')}"`
            : 'Field';
        return `${field}: ${firstError.message}`;
    }
    return null;
};
// Helper function to prepare RFP data from frontend
export const prepareRFPData = (data) => {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
        rfpNumber: data.rfpNumber || `RFP-${now.getTime()}`,
        title: data.title || '',
        issuer: data.issuer || '',
        industry: data.industry || 'Other',
        source: data.source || 'MANUAL',
        sourceUrl: data.sourceUrl || '',
        submissionDeadline: data.submissionDeadline || thirtyDaysLater.toISOString(),
        clarificationDeadline: data.clarificationDeadline || '',
        priority: data.priority || 'MEDIUM',
        estimatedValue: data.estimatedValue,
        currency: data.currency || 'USD',
        region: data.region || '',
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
        description: data.description || '',
        requirements: data.requirements || '',
    };
};
// Sample data for testing
export const sampleRFPCreateData = {
    rfpNumber: 'RFP-2024-001',
    title: 'Industrial Automation System Upgrade',
    issuer: 'ACME Manufacturing Corporation',
    industry: 'Manufacturing',
    source: 'MANUAL',
    sourceUrl: '',
    submissionDeadline: '2024-12-31T23:59:59.000Z',
    clarificationDeadline: '2024-12-15T23:59:59.000Z',
    priority: 'MEDIUM',
    estimatedValue: 500000,
    currency: 'USD',
    region: 'North America',
    tags: ['automation', 'sensors', 'plc', 'manufacturing'],
    description: 'Upgrade of industrial automation system with new sensors, PLC controllers, and HMI panels for improved efficiency and monitoring.',
    requirements: 'Temperature sensors (-40°C to 125°C range), PLC controllers with 24+ I/O, HMI touchscreen panels (10" minimum), and integration with existing SCADA system.'
};
// Alternative synchronous validation function
export const validateRFPDataSync = (data) => {
    try {
        const validatedData = rfpCreateSchema.parse(data);
        return {
            isValid: true,
            errors: [],
            validatedData
        };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            // @ts-ignore
            const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
            return {
                isValid: false,
                errors
            };
        }
        return {
            isValid: false,
            errors: ['Unknown validation error']
        };
    }
};
//# sourceMappingURL=validators.js.map