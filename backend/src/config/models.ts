import config from './environment.js';

export const MODEL_CONFIGS = {
  [config.models.primary]: {
    name: 'Claude Sonnet 4',
    maxTokens: 8192,
    contextWindow: 200000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    useCase: ['critical', 'high', 'medium'],
  },
  [config.models.fallback]: {
    name: 'Claude 3.5 Sonnet',
    maxTokens: 8192,
    contextWindow: 200000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    useCase: ['low', 'medium'],
  },
};

export const COMPLEXITY_MODEL_MAP = {
  CRITICAL: config.models.primary,
  HIGH: config.models.primary,
  MEDIUM: config.models.primary,
  LOW: config.models.fallback,
};