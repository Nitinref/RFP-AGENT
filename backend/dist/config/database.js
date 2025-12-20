import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
const prisma = new PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
    ],
});
prisma.$on('query', (e) => {
    if (process.env.LOG_QUERIES === 'true') {
        logger.debug('Query', { query: e.query, duration: e.duration });
    }
});
export default prisma;
//# sourceMappingURL=database.js.map