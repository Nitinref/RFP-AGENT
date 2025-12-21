// backend/src/services/ModelService.ts
import { Complexity } from '@prisma/client';
import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';
import config from '../config/environment.js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
export class ModelService {
    static instance;
    openai;
    gemini;
    constructor() {
        // ✅ Initialize OpenAI client
        this.openai = new OpenAI({
            apiKey: config.openai.apiKey,
        });
        // ✅ Initialize Gemini client
        this.gemini = new GoogleGenerativeAI(config.gemini.apiKey);
    }
    static getInstance() {
        if (!ModelService.instance) {
            ModelService.instance = new ModelService();
        }
        return ModelService.instance;
    }
    async execute(params) {
        const { prompt, taskType, complexity, systemPrompt, temperature = 0.3, maxTokens = 2048, workflowRunId, agentActivityId, } = params;
        const { primaryModel, chosenModel, isFallback, provider } = this.selectModel(complexity, taskType);
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
            let response;
            // ✅ Route to correct provider
            if (provider === 'openai') {
                response = await this.callOpenAI(chosenModel, prompt, systemPrompt, temperature, maxTokens);
            }
            else if (provider === 'gemini') {
                response = await this.callGemini(chosenModel, prompt, systemPrompt, temperature, maxTokens);
            }
            else {
                throw new Error(`Unknown provider: ${provider}`);
            }
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
            logger.error('Model execution failed', { error: error.message, chosenModel, taskType });
            // Try fallback
            if (!isFallback) {
                logger.info('Attempting fallback model');
                try {
                    const fallbackProvider = config.models.fallbackProvider;
                    const fallbackModel = config.models.fallback;
                    let fallbackResponse;
                    if (fallbackProvider === 'openai') {
                        fallbackResponse = await this.callOpenAI(fallbackModel, prompt, systemPrompt, temperature, maxTokens);
                    }
                    else {
                        fallbackResponse = await this.callGemini(fallbackModel, prompt, systemPrompt, temperature, maxTokens);
                    }
                    if (modelDecision) {
                        await prisma.modelDecision.update({
                            where: { id: modelDecision.id },
                            data: {
                                chosenModel: fallbackModel,
                                isFallback: true,
                                wasSuccessful: true,
                                actualTokensUsed: fallbackResponse.tokenUsage,
                            },
                        });
                    }
                    return fallbackResponse.content;
                }
                catch (fallbackError) {
                    logger.error('Fallback model also failed', { fallbackError: fallbackError.message });
                    throw fallbackError;
                }
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
        const primaryProvider = config.models.primaryProvider;
        let chosenModel = primaryModel;
        let provider = primaryProvider;
        let isFallback = false;
        // Use fallback for LOW complexity tasks to save costs
        if (complexity === Complexity.LOW) {
            chosenModel = config.models.fallback;
            provider = config.models.fallbackProvider;
            isFallback = true;
        }
        return { primaryModel, chosenModel, isFallback, provider };
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
    // ═══════════════════════════════════════════════════════════
    // OPENAI INTEGRATION
    // ═══════════════════════════════════════════════════════════
    async callOpenAI(model, prompt, systemPrompt, temperature = 0.3, maxTokens = 2048) {
        logger.info('🤖 Calling OpenAI API', { model, temperature, maxTokens });
        try {
            const completion = await this.openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt || 'You are a helpful AI assistant.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: temperature,
                max_tokens: maxTokens,
            });
            const content = completion.choices[0]?.message?.content || '';
            const tokenUsage = completion.usage?.total_tokens || 0;
            logger.info('✅ OpenAI API call successful', {
                model,
                inputTokens: completion.usage?.prompt_tokens,
                outputTokens: completion.usage?.completion_tokens,
                totalTokens: tokenUsage,
            });
            return { content, tokenUsage };
        }
        catch (error) {
            logger.error('❌ OpenAI API call failed', {
                error: error.message,
                model,
                statusCode: error.status,
            });
            if (error.status === 401) {
                throw new Error('Invalid OpenAI API key. Check your .env file.');
            }
            if (error.status === 429) {
                throw new Error('OpenAI API rate limit exceeded. Please wait and retry.');
            }
            if (error.code === 'insufficient_quota') {
                throw new Error('OpenAI API quota exceeded. Add credits to your account.');
            }
            throw error;
        }
    }
    // ═══════════════════════════════════════════════════════════
    // GEMINI INTEGRATION
    // ═══════════════════════════════════════════════════════════
    async callGemini(model, prompt, systemPrompt, temperature = 0.3, maxTokens = 2048) {
        logger.info('🤖 Calling Gemini API', { model, temperature, maxTokens });
        try {
            const geminiModel = this.gemini.getGenerativeModel({ model });
            // Combine system prompt and user prompt
            const fullPrompt = systemPrompt
                ? `${systemPrompt}\n\n${prompt}`
                : prompt;
            const result = await geminiModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: maxTokens,
                },
            });
            const response = await result.response;
            const content = response.text();
            // Gemini doesn't always return token usage, estimate it
            const tokenUsage = Math.ceil((fullPrompt.length + content.length) / 4);
            logger.info('✅ Gemini API call successful', {
                model,
                estimatedTokens: tokenUsage,
            });
            return { content, tokenUsage };
        }
        catch (error) {
            logger.error('❌ Gemini API call failed', {
                error: error.message,
                model,
            });
            if (error.message?.includes('API key')) {
                throw new Error('Invalid Gemini API key. Check your .env file.');
            }
            if (error.message?.includes('quota')) {
                throw new Error('Gemini API quota exceeded.');
            }
            throw error;
        }
    }
}
export default ModelService;
//# sourceMappingURL=ModelService.js.map