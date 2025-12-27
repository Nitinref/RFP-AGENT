import app from './api/server.js';
import config from './config/environment.js';
import { logger } from './utils/logger.js';
import { prisma } from './prisma/index.js';
import authRoutes from './routes/auth.routes.js';
import { EmailIngestionService } from "./services/EmailIngestionService.js";
import { initQdrant } from "./vector/initQdrant.js";
// Add with other routes (around line where other routes are)
import cors from "cors";
import { ProductIngestionService } from "./services/ProductIngestionService.js";
const productService = new ProductIngestionService();
await productService.ingestProducts();
const gmailIngestion = new EmailIngestionService();
// 🔥 run once on server start
gmailIngestion.scanInbox().catch((err) => {
    console.error("Gmail ingestion failed", err);
});
app.use(cors({
    origin: 'http://localhost:3001', // ✅ Frontend port 3001
    credentials: true
}));
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
// ✅ THEN ROUTES
app.use('/api/auth', authRoutes);
async function startServer() {
    try {
        await prisma.$connect();
        logger.info('Database connected successfully');
        await initQdrant();
        const server = app.listen(config.port, () => {
            logger.info(`🚀 Server running on port ${config.port}`, {
                env: config.env,
                port: config.port,
            });
        });
        const gracefulShutdown = async (signal) => {
            logger.info(`${signal} received, shutting down gracefully...`);
            server.close(async () => {
                logger.info('HTTP server closed');
                await prisma.$disconnect();
                logger.info('Database disconnected');
                process.exit(0);
            });
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection', { reason, promise });
        });
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception', { error });
            process.exit(1);
        });
    }
    catch (error) {
        logger.error('Failed to start server', { error });
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map