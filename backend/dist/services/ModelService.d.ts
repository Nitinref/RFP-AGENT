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
    private constructor();
    static getInstance(): ModelService;
    execute(params: ModelExecutionParams): Promise<string>;
    private selectModel;
    private getModelSelectionReason;
    private callModel;
}
export default ModelService;
