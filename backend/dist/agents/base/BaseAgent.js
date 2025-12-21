import { prisma } from "../../prisma/index.js";
import { logger } from "../../utils/logger.js";
import { ModelService } from "../../services/ModelService.js";
import { AgentStatus } from "@prisma/client";
export class BaseAgent {
    agentType;
    modelService;
    constructor(agentType) {
        this.agentType = agentType;
        this.modelService = ModelService.getInstance();
    }
    // 🔥 GLOBAL JSON CLEANER (fixes ```json issues everywhere)
    cleanJsonResponse(raw) {
        if (!raw)
            return raw;
        return raw
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
    }
    async execute(input) {
        const startTime = Date.now();
        let agentActivity = null;
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
                    inputData: input.data,
                },
            });
            // ─────────────────────────────────────────────
            // Run agent logic
            // ─────────────────────────────────────────────
            const result = await this.run(input);
            const durationMs = Date.now() - startTime;
            // ─────────────────────────────────────────────
            // Mark agent completed
            // ─────────────────────────────────────────────
            await prisma.agentActivity.update({
                where: { id: agentActivity.id },
                data: {
                    status: AgentStatus.COMPLETED,
                    outputData: result.data,
                    completedAt: new Date(),
                    durationMs,
                },
            });
            await prisma.workflowRun.update({
                where: { id: input.context.workflowRunId },
                data: { completedSteps: { increment: 1 } },
            });
            return result;
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            const errorMessage = error.message;
            logger.error(`Agent ${this.agentType} failed`, {
                message: errorMessage,
                stack: error.stack,
                agentType: this.agentType,
                workflowRunId: input.context.workflowRunId,
            });
            // If activity creation failed
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
                const retryDelay = Math.pow(2, agentActivity.retryCount) * 1000;
                logger.info(`Retrying agent ${this.agentType}`, {
                    retryCount: agentActivity.retryCount + 1,
                    delayMs: retryDelay,
                });
                await new Promise((res) => setTimeout(res, retryDelay));
                return this.execute(input);
            }
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    // 🔥 ALL agents automatically get clean JSON now
    async executeModel(prompt, taskType, complexity, systemPrompt, temperature, maxTokens, workflowRunId, agentActivityId) {
        const raw = await this.modelService.execute({
            prompt,
            taskType,
            complexity,
            systemPrompt,
            temperature,
            maxTokens,
            workflowRunId,
            agentActivityId,
        });
        return this.cleanJsonResponse(raw);
    }
}
export default BaseAgent;
//# sourceMappingURL=BaseAgent.js.map