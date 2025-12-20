import config from '../config/environment.js';
import { UnauthorizedError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import jwt from "jsonwebtoken";
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        logger.error('Authentication failed', { error });
        next(new UnauthorizedError('Invalid token'));
    }
};
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError('User not authenticated'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new UnauthorizedError('Insufficient permissions'));
        }
        next();
    };
};
export const generateToken = (payload) => {
    const secret = config.jwt.secret;
    const options = {
        expiresIn: config.jwt.expiresIn,
    };
    return jwt.sign(payload, secret, options);
};
//# sourceMappingURL=auth.js.map