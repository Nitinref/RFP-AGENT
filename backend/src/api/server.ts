// server.ts - Complete version
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from '../config/environment.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { requestLogger } from '../middleware/logger.js';

// Import ALL routes
import healthRoutes from './routes/health.routes.js';
import rfpRoutes from './routes/rfp.routes.js';
import { workflowRoutes } from './routes/workflow.routes.js';
import authRoutes from '../routes/auth.routes.js';
import analyticsRoutes from '../routes/analytics.routes.js'; // ✅ ADD THIS
import userRoutes from '../routes/user.route.js'; // ✅ ADD THIS

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'], // Expose Authorization header
}));



app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // ✅ ADD THIS
app.use('/api/rfps', rfpRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/analytics', analyticsRoutes); // ✅ ADD THIS

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error Handler
app.use(errorHandler);

export default app;