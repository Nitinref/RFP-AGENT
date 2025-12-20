import { Router } from 'express';
import { prisma } from '../../prisma/index.js';
import { logger } from '../../utils/logger.js';
const router = Router();
router.get('/', async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'up',
                api: 'up',
            },
        });
    }
    catch (error) {
        logger.error('Health check failed', { error });
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'down',
                api: 'up',
            },
        });
    }
});
export default router;
//# sourceMappingURL=health.routes.js.map