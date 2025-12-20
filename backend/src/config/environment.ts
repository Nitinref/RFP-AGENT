import dotenv from 'dotenv';
import { z } from 'zod';
import type { SignOptions } from "jsonwebtoken";
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  
  // API Keys
  ANTHROPIC_API_KEY: z.string(),
  
  // Models
  PRIMARY_MODEL: z.string().default('claude-sonnet-4-20250514'),
  FALLBACK_MODEL: z.string().default('claude-3-5-sonnet-20241022'),
  
  // JWT & Auth
  JWT_SECRET: z.string().default('your-secret-key-change-in-production'),
  
JWT_EXPIRES_IN: z.custom<SignOptions["expiresIn"]>().default('7d'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  // Logging
  LOG_LEVEL: z.string().default('info'),
  LOG_QUERIES: z.string().default('false'),
  
  // File Upload
  MAX_FILE_SIZE_MB: z.string().default('50'),
  UPLOAD_DIR: z.string().default('./uploads'),
  
  // Workflow
  MAX_RETRIES: z.string().default('3'),
  RETRY_DELAY_MS: z.string().default('1000'),
});

const env = envSchema.parse(process.env);

const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  database: {
    url: env.DATABASE_URL,
  },
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
  },
  models: {
    primary: env.PRIMARY_MODEL,
    fallback: env.FALLBACK_MODEL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },
  logging: {
    level: env.LOG_LEVEL,
    logQueries: env.LOG_QUERIES === 'true',
  },
  upload: {
    maxFileSizeMB: parseInt(env.MAX_FILE_SIZE_MB, 10),
    uploadDir: env.UPLOAD_DIR,
  },
  workflow: {
    maxRetries: parseInt(env.MAX_RETRIES, 10),
    retryDelayMs: parseInt(env.RETRY_DELAY_MS, 10),
  },
};

export default config;