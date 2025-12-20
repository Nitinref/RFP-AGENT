import { prisma } from "../../prisma/index.js";
import { logger } from "../../utils/logger.js";
import { ModelService } from "../../services/ModelService.js";
import { AgentInput, AgentOutput } from "../../types/agents.types.js";
import { AgentStatus, AgentType, Complexity } from "@prisma/client";
import type { AgentActivity } from "@prisma/client";

export abstract class BaseAgent {
  protected agentType: AgentType;
  protected modelService: ModelService;

  constructor(agentType: AgentType) {
    this.agentType = agentType;
    this.modelService = ModelService.getInstance();
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();

    // ✅ MUST be nullable
    let agentActivity: AgentActivity | null = null;

    try {
      // ─────────────────────────────────────────────
      // Create agent activity
      // ─────────────────────────────────────────────
      agentActivity = await prisma.agentActivity.create({
        data: {
          workflowRunId: input.context.workflowRunId,
          agentType: this.agentType,
          action: `execute_${this.agentType.toLowerCase()}`,
          status: AgentStatus.IN_PROGRESS,
          stepNumber: input.context.stepNumber,
          inputData: input.data as any,
        },
      });

      // ─────────────────────────────────────────────
      // Run agent logic
      // ─────────────────────────────────────────────
      const result = await this.run(input);
      const durationMs = Date.now() - startTime;

      // ─────────────────────────────────────────────
      // Mark agent as completed
      // ─────────────────────────────────────────────
      await prisma.agentActivity.update({
        where: { id: agentActivity.id },
        data: {
          status: AgentStatus.COMPLETED,
          outputData: result.data as any,
          completedAt: new Date(),
          durationMs,
        },
      });

      await prisma.workflowRun.update({
        where: { id: input.context.workflowRunId },
        data: { completedSteps: { increment: 1 } },
      });

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = (error as Error).message;

      logger.error(`Agent ${this.agentType} failed`, {
        error: errorMessage,
        agentType: this.agentType,
        workflowRunId: input.context.workflowRunId,
      });

      // ✅ GUARDED — TS & runtime safe
      if (!agentActivity) {
        return {
          success: false,
          error: errorMessage,
        };
      }

      const canRetry = agentActivity.retryCount < agentActivity.maxRetries;

      await prisma.agentActivity.update({
        where: { id: agentActivity.id },
        data: {
          status: canRetry ? AgentStatus.RETRYING : AgentStatus.FAILED,
          error: errorMessage,
          completedAt: new Date(),
          durationMs,
          retryCount: { increment: 1 },
        },
      });

      await prisma.workflowRun.update({
        where: { id: input.context.workflowRunId },
        data: { failedSteps: { increment: 1 } },
      });

      // ─────────────────────────────────────────────
      // Retry with exponential backoff
      // ─────────────────────────────────────────────
      if (canRetry) {
        logger.info(`Retrying agent ${this.agentType}`, {
          retryCount: agentActivity.retryCount + 1,
        });

        const retryCount = agentActivity.retryCount;

        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );

        return this.execute(input);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  protected async executeModel(
    prompt: string,
    taskType: string,
    complexity: Complexity,
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
    workflowRunId?: string,
    agentActivityId?: string
  ): Promise<string> {
    return this.modelService.execute({
      prompt,
      taskType,
      complexity,
      systemPrompt,
      temperature,
      maxTokens,
      workflowRunId,
      agentActivityId,
    });
  }

  protected abstract run(input: AgentInput): Promise<AgentOutput>;
}

export default BaseAgent;
