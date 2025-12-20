import { Complexity } from '@prisma/client';
import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';
import config from '../config/environment.js';
export class ModelService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!ModelService.instance) {
            ModelService.instance = new ModelService();
        }
        return ModelService.instance;
    }
    async execute(params) {
        const { prompt, taskType, complexity, systemPrompt, temperature = 0.3, maxTokens = 2048, workflowRunId, agentActivityId, } = params;
        const { primaryModel, chosenModel, isFallback } = this.selectModel(complexity, taskType);
        let modelDecision;
        if (workflowRunId && agentActivityId) {
            modelDecision = await prisma.modelDecision.create({
                data: {
                    workflowRunId,
                    agentActivityId,
                    primaryModel,
                    chosenModel,
                    isFallback,
                    reason: this.getModelSelectionReason(complexity, taskType, isFallback),
                    taskType,
                    taskComplexity: complexity,
                    estimatedTokens: maxTokens,
                },
            });
        }
        try {
            const response = await this.callModel(chosenModel, prompt, systemPrompt, temperature, maxTokens);
            if (modelDecision) {
                await prisma.modelDecision.update({
                    where: { id: modelDecision.id },
                    data: {
                        wasSuccessful: true,
                        actualTokensUsed: response.tokenUsage,
                    },
                });
            }
            return response.content;
        }
        catch (error) {
            logger.error('Model execution failed', { error, chosenModel, taskType });
            if (!isFallback) {
                logger.info('Attempting fallback model');
                const fallbackResponse = await this.callModel(config.models.fallback, prompt, systemPrompt, temperature, maxTokens);
                if (modelDecision) {
                    await prisma.modelDecision.update({
                        where: { id: modelDecision.id },
                        data: {
                            chosenModel: config.models.fallback,
                            isFallback: true,
                            wasSuccessful: true,
                            actualTokensUsed: fallbackResponse.tokenUsage,
                        },
                    });
                }
                return fallbackResponse.content;
            }
            if (modelDecision) {
                await prisma.modelDecision.update({
                    where: { id: modelDecision.id },
                    data: { wasSuccessful: false },
                });
            }
            throw error;
        }
    }
    selectModel(complexity, taskType) {
        const primaryModel = config.models.primary;
        let chosenModel = primaryModel;
        let isFallback = false;
        // Use fallback for LOW complexity tasks to save costs
        if (complexity === Complexity.LOW) {
            chosenModel = config.models.fallback;
            isFallback = true;
        }
        return { primaryModel, chosenModel, isFallback };
    }
    getModelSelectionReason(complexity, taskType, isFallback) {
        if (isFallback && complexity === Complexity.LOW) {
            return 'Using fallback model for low-complexity task to optimize costs';
        }
        if (complexity === Complexity.CRITICAL) {
            return 'Using primary model for critical task requiring highest accuracy';
        }
        return `Task complexity: ${complexity}, Type: ${taskType}`;
    }
    async callModel(model, prompt, systemPrompt, temperature = 0.3, maxTokens = 2048) {
        // Simulate API call - replace with actual Anthropic API call
        logger.info('Calling model', { model, temperature, maxTokens });
        // This is a placeholder - integrate with actual Anthropic API
        const mockResponse = {
            content: JSON.stringify({
                result: 'This is a mock response. Integrate with Anthropic API.',
            }),
            tokenUsage: Math.floor(Math.random() * 1000) + 500,
        };
        return mockResponse;
    }
}
export default ModelService;
//# sourceMappingURL=ModelService.js.map