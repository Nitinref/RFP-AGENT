import config from './environment.js';

export const MODEL_CONFIGS = {
  // OpenAI Models (unchanged)
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'openai',
    maxTokens: 4096,
    contextWindow: 128000,
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    useCase: ['critical', 'high', 'medium'],
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'openai',
    maxTokens: 4096,
    contextWindow: 128000,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    useCase: ['low', 'medium'],
  },
  
  // Gemini Models - UPDATED (replaced deprecated models)
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    maxTokens: 8192,
    contextWindow: 2000000,  // 2M tokens for gemini-2.5-pro
    costPer1kInput: 0.0025,  // Updated: Check latest pricing
    costPer1kOutput: 0.01,   // Updated: Check latest pricing
    useCase: ['critical', 'high', 'medium'],
  },
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    maxTokens: 8192,
    contextWindow: 1000000,  // 1M tokens for gemini-2.5-flash
    costPer1kInput: 0.0001,  // Updated: Check latest pricing
    costPer1kOutput: 0.0004, // Updated: Check latest pricing
    useCase: ['low', 'medium'],
  },
  // Optional: Latest preview model
  'gemini-3-flash-preview': {
    name: 'Gemini 3 Flash Preview',
    provider: 'gemini',
    maxTokens: 8192,
    contextWindow: 1000000,
    costPer1kInput: 0.0001,   // Preview pricing - confirm with Google
    costPer1kOutput: 0.0004,  // Preview pricing - confirm with Google
    useCase: ['low', 'medium'],
  },
};

export const COMPLEXITY_MODEL_MAP = {
  CRITICAL: config.models.primary,   // Will use 'gemini-2.5-pro'
  HIGH: config.models.primary,       // Will use 'gemini-2.5-pro'
  MEDIUM: config.models.primary,     // Will use 'gemini-2.5-pro'
  LOW: config.models.fallback,       // Will use 'gemini-2.5-flash'
};