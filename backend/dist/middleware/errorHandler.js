import { logger } from '../utils/logger.js';
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        logger.error('Operational error', {
            message: err.message,
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
        });
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }
    logger.error('Unexpected error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    return res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
};
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
//# sourceMappingURL=errorHandler.js.map