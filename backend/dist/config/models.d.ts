import config from './environment.js';
export declare const MODEL_CONFIGS: {
    [config.models.primary]: {
        name: string;
        maxTokens: number;
        contextWindow: number;
        costPer1kInput: number;
        costPer1kOutput: number;
        useCase: string[];
    };
    [config.models.fallback]: {
        name: string;
        maxTokens: number;
        contextWindow: number;
        costPer1kInput: number;
        costPer1kOutput: number;
        useCase: string[];
    };
};
export declare const COMPLEXITY_MODEL_MAP: {
    CRITICAL: string;
    HIGH: string;
    MEDIUM: string;
    LOW: string;
};
