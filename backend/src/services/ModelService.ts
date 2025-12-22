// backend/src/services/ModelService.ts
import { Complexity } from '@prisma/client';
import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';
import config from '../config/environment.js';
import OpenAI from 'openai';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

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

export class ModelService {
  private static instance: ModelService;
  private openai: OpenAI;
  private genAI: GoogleGenerativeAI;
  private geminiModels: Map<string, GenerativeModel> = new Map();

  private constructor() {
    // ✅ Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    // ✅ Initialize Gemini client
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }

  static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  async execute(params: ModelExecutionParams): Promise<string> {
    const {
      prompt,
      taskType,
      complexity,
      systemPrompt,
      temperature = 0.3,
      maxTokens = 2048,
      workflowRunId,
      agentActivityId,
    } = params;

    // Choose model based on config
    const { modelId, provider, isFallback } = this.selectModel(complexity, taskType);

    // Log model decision
    if (workflowRunId && agentActivityId) {
      await prisma.modelDecision.create({
        data: {
          workflowRunId,
          agentActivityId,
          primaryModel: config.models.primary,
          chosenModel: modelId,
          isFallback,
          reason: this.getModelSelectionReason(complexity, taskType, isFallback),
          taskType,
          taskComplexity: complexity,
          estimatedTokens: maxTokens,
        },
      });
    }

    logger.info('🤖 Executing model', {
      provider,
      model: modelId,
      taskType,
      complexity,
    });

    try {
      let result: { content: string; tokenUsage: number };

      // Route to correct provider
      if (provider === 'openai') {
        result = await this.callOpenAI(modelId, prompt, systemPrompt, temperature, maxTokens);
      } else if (provider === 'gemini') {
        result = await this.callGemini(modelId, prompt, systemPrompt, temperature, maxTokens);
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }

      logger.info('✅ Model execution successful', {
        provider,
        model: modelId,
        tokenUsage: result.tokenUsage,
      });

      return result.content;
    } catch (error: any) {
      logger.error('❌ Model execution failed', {
        provider,
        model: modelId,
        error: error.message,
        taskType,
      });

      // Try fallback model
      if (!isFallback) {
        logger.info('🔄 Attempting fallback model');
        const fallbackConfig = this.getFallbackConfig();

        try {
          let fallbackResult;
          if (fallbackConfig.provider === 'openai') {
            fallbackResult = await this.callOpenAI(
              fallbackConfig.model,
              prompt,
              systemPrompt,
              temperature,
              maxTokens
            );
          } else {
            fallbackResult = await this.callGemini(
              fallbackConfig.model,
              prompt,
              systemPrompt,
              temperature,
              maxTokens
            );
          }

          logger.info('✅ Fallback model successful', {
            provider: fallbackConfig.provider,
            model: fallbackConfig.model,
            tokenUsage: fallbackResult.tokenUsage,
          });

          return fallbackResult.content;
        } catch (fallbackError: any) {
          logger.error('❌ Fallback model also failed', {
            error: fallbackError.message,
          });
          throw new Error(`Primary and fallback models failed: ${error.message}`);
        }
      }

      throw error;
    }
  }

  private selectModel(complexity: Complexity, taskType: string) {
    const primaryModel = config.models.primary;
    const primaryProvider = config.models.primaryProvider;

    const fallbackModel = config.models.fallback;
    const fallbackProvider = config.models.fallbackProvider;

    // LOW complexity → fallback
    if (complexity === Complexity.LOW) {
      return {
        modelId: fallbackModel,
        provider: fallbackProvider,
        isFallback: true,
      };
    }

    // HIGH / CRITICAL → primary
    return {
      modelId: primaryModel,
      provider: primaryProvider,
      isFallback: false,
    };
  }


  private getFallbackConfig() {
    if (!config.models.fallback || !config.models.fallbackProvider) {
      throw new Error("Fallback model configuration missing");
    }

    return {
      model: config.models.fallback,
      provider: config.models.fallbackProvider,
    };
  }


  private getModelSelectionReason(complexity: Complexity, taskType: string, isFallback: boolean): string {
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

  private async callOpenAI(
    modelId: string,
    prompt: string,
    systemPrompt?: string,
    temperature: number = 0.3,
    maxTokens: number = 2048
  ): Promise<{ content: string; tokenUsage: number }> {
    logger.info("🔥 OPENAI API HIT", {
      model: modelId,
    });

    try {
      const completion = await this.openai.chat.completions.create({
        model: modelId,
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

      return { content, tokenUsage };
    } catch (error: any) {
      logger.error('❌ OpenAI API call failed', {
        model: modelId,
        error: error.message,
        statusCode: error.status,
      });

      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key');
      }
      if (error.status === 429) {
        throw new Error('OpenAI rate limit exceeded');
      }
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI quota exceeded');
      }

      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GEMINI INTEGRATION - FIXED VERSION
  // ═══════════════════════════════════════════════════════════


  private async callGemini(
    modelId: string,
    prompt: string,
    systemPrompt?: string,
    temperature: number = 0.3,
    maxTokens: number = 2048
  ): Promise<{ content: string; tokenUsage: number }> {
    logger.info("🔥 GEMINI API HIT", {
      model: modelId,
    });
    try {
      // Get or create model instance
      if (!this.geminiModels.has(modelId)) {
        const modelConfig: any = {
          model: modelId,
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
            topP: 0.95,
            topK: 40,
          },
        };

        // Add system instruction if provided
        if (systemPrompt) {
          modelConfig.systemInstruction = systemPrompt;
        }

        const model = this.genAI.getGenerativeModel(modelConfig);
        this.geminiModels.set(modelId, model);
      }

      const model = this.geminiModels.get(modelId)!;

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Try to get token usage
      let tokenUsage = 0;
      try {
        // @ts-ignore - usageMetadata might not be in all versions
        const usageMetadata = result.response.usageMetadata;
        if (usageMetadata) {
          tokenUsage = usageMetadata.totalTokenCount || 0;
        }
      } catch (e) {
        // Estimate tokens if metadata not available
        tokenUsage = Math.ceil((prompt.length + content.length) / 4);
      }

      return { content, tokenUsage };
    } catch (error: any) {
      logger.error('❌ Gemini API call failed', {
        model: modelId,
        error: error.message,
        statusCode: error.status,
      });

      if (error.message?.includes('API key')) {
        throw new Error('Invalid Gemini API key');
      }
      if (error.message?.includes('quota')) {
        throw new Error('Gemini quota exceeded');
      }
      if (error.message?.includes('safety')) {
        throw new Error('Gemini safety filters triggered');
      }
      if (error.message?.includes('429')) {
        throw new Error('Gemini rate limit exceeded');
      }

      throw error;
    }
  }
}

export default ModelService;