// server.ts – FINAL FIXED VERSION

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import config from '../config/environment.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { requestLogger } from '../middleware/logger.js';
import { initQdrant } from "../vector/initQdrant.js";

// Routes
import healthRoutes from './routes/health.routes.js';
import rfpRoutes from './routes/rfp.routes.js';
import { workflowRoutes } from './routes/workflow.routes.js';
import authRoutes from '../routes/auth.routes.js';
import analyticsRoutes from '../routes/analytics.routes.js';
import userRoutes from '../routes/user.route.js';
import testRoutes from './routes/test.routes.js';
import ingestionRoutes from './routes/ingestion.routes.js';

const app = express();

/* ================= GLOBAL MIDDLEWARE ================= */

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    exposedHeaders: ['Authorization'],
  })
);

// Compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);
await initQdrant();

// Rate limiting (AFTER logger, BEFORE routes)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP',
  },
});
app.use('/api', limiter);

/* ================= ROUTES ================= */

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rfps', rfpRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ingestion', ingestionRoutes);
app.use('/test', testRoutes);

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

export default app;
