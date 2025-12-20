export interface ModelRequest {
    model: string;
    messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
    }>;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}
export interface ModelResponse {
    content: string;
    tokenUsage: {
        input: number;
        output: number;
        total: number;
    };
    model: string;
    finishReason: string;
}
export interface ModelSelectionCriteria {
    complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    taskType: string;
    estimatedTokens?: number;
    requiresHighAccuracy?: boolean;
}
