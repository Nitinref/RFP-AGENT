import { Complexity } from '@prisma/client';
interface ModelExecutionParams {
    prompt: string;
    taskType: string;
    complexity: Complexity;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    workflowRunId?: string;
    agentActivityId?: string;
}
export declare class ModelService {
    private static instance;
    private openai;
    private gemini;
    private constructor();
    static getInstance(): ModelService;
    execute(params: ModelExecutionParams): Promise<string>;
    private selectModel;
    private getModelSelectionReason;
    private callOpenAI;
    private callGemini;
}
export default ModelService;
