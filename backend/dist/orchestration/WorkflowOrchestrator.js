import { TriggerType, WorkflowStatus } from '@prisma/client';
import { prisma } from ".././prisma/index.js";
import { logger } from '../utils/logger.js';
import OrchestratorAgent from '../agents/OrchestratorAgent.js';
export class WorkflowOrchestrator {
    static instance;
    orchestratorAgent;
    constructor() {
        this.orchestratorAgent = new OrchestratorAgent();
    }
    static getInstance() {
        if (!WorkflowOrchestrator.instance) {
            WorkflowOrchestrator.instance = new WorkflowOrchestrator();
        }
        return WorkflowOrchestrator.instance;
    }
    async startWorkflow(rfpId, triggerType, triggerReason, userId) {
        logger.info('Starting workflow', { rfpId, triggerType });
        try {
            const rfp = await prisma.rFP.findUnique({
                where: { id: rfpId },
                include: { workflowRuns: true },
            });
            if (!rfp) {
                throw new Error(`RFP ${rfpId} not found`);
            }
            const runNumber = (rfp.workflowRuns?.length || 0) + 1;
            const workflowRun = await prisma.workflowRun.create({
                data: {
                    rfpId,
                    runNumber,
                    triggerType,
                    triggerReason,
                    status: WorkflowStatus.RUNNING,
                    totalSteps: 4,
                    completedSteps: 0,
                    createdBy: userId,
                },
            });
            await prisma.rFP.update({
                where: { id: rfpId },
                data: { status: 'IN_PROGRESS' },
            });
            // Execute orchestrator asynchronously
            this.executeWorkflow(rfpId, workflowRun.id).catch((error) => {
                logger.error('Workflow execution failed', { error, workflowRunId: workflowRun.id });
            });
            return {
                workflowRunId: workflowRun.id,
                status: WorkflowStatus.RUNNING,
                message: 'Workflow started successfully',
            };
        }
        catch (error) {
            logger.error('Failed to start workflow', { error, rfpId });
            throw error;
        }
    }
    async executeWorkflow(rfpId, workflowRunId) {
        try {
            const input = {
                context: {
                    rfpId,
                    workflowRunId,
                    stepNumber: 0,
                },
                data: {},
            };
            const result = await this.orchestratorAgent.execute(input);
            if (result.success) {
                await prisma.workflowRun.update({
                    where: { id: workflowRunId },
                    data: {
                        status: WorkflowStatus.COMPLETED,
                        completedAt: new Date(),
                        durationMs: Date.now() - new Date((await prisma.workflowRun.findUnique({ where: { id: workflowRunId } })).startedAt).getTime(),
                    },
                });
                await prisma.rFP.update({
                    where: { id: rfpId },
                    data: { status: 'REVIEW' },
                });
            }
            else {
                throw new Error(result.error);
            }
        }
        catch (error) {
            logger.error('Workflow execution error', { error, workflowRunId });
            await prisma.workflowRun.update({
                where: { id: workflowRunId },
                data: {
                    status: WorkflowStatus.FAILED,
                    completedAt: new Date(),
                    error: error.message,
                },
            });
            await prisma.rFP.update({
                where: { id: rfpId },
                data: { status: 'NEW' },
            });
        }
    }
    async getWorkflowStatus(workflowRunId) {
        const workflowRun = await prisma.workflowRun.findUnique({
            where: { id: workflowRunId },
            include: {
                agentActivities: {
                    orderBy: { stepNumber: 'asc' },
                },
                modelDecisions: true,
                rfp: true,
            },
        });
        if (!workflowRun) {
            throw new Error(`Workflow run ${workflowRunId} not found`);
        }
        return workflowRun;
    }
    async retryWorkflow(workflowRunId) {
        const workflowRun = await prisma.workflowRun.findUnique({
            where: { id: workflowRunId },
        });
        if (!workflowRun) {
            throw new Error(`Workflow run ${workflowRunId} not found`);
        }
        if (workflowRun.status !== WorkflowStatus.FAILED) {
            throw new Error('Can only retry failed workflows');
        }
        return this.startWorkflow(workflowRun.rfpId, TriggerType.RETRY, `Retry of workflow run ${workflowRunId}`, workflowRun.createdBy || undefined);
    }
}
export default WorkflowOrchestrator;
//# sourceMappingURL=WorkflowOrchestrator.js.map