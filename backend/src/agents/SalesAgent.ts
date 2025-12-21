import { AgentType, Complexity, Priority } from '@prisma/client';
import BaseAgent from './base/BaseAgent.js';
import { AgentInput, AgentOutput } from '../types/agents.types.js';
import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';

export class SalesAgent extends BaseAgent {
  constructor() {
    super(AgentType.SALES_SCOUT);
  }

  protected async run(input: AgentInput): Promise<AgentOutput> {
    logger.info('Sales Agent: Starting RFP triage', {
      rfpId: input.context.rfpId,
    });

    try {
      const rfp = await prisma.rFP.findUnique({
        where: { id: input.context.rfpId },
        include: {
          documentChunks: true,
        },
      });

      if (!rfp) {
        throw new Error(`RFP ${input.context.rfpId} not found`);
      }

      const analysis = await this.analyzeRFP(rfp, input.context.workflowRunId);

      await prisma.rFP.update({
        where: { id: rfp.id },
        data: {
          priority: analysis.priority,
          status: 'ANALYZING',
        },
      });

      logger.info('Sales Agent: Triage completed', {
        rfpId: rfp.id,
        priority: analysis.priority,
        strategicValue: analysis.strategicValue,
      });

      return {
        success: true,
        data: {
          priority: analysis.priority,
          strategicValue: analysis.strategicValue,
          winProbability: analysis.winProbability,
          recommendations: analysis.recommendations,
        },
      };
    }catch (error) {
  logger.error('Sales Agent execution failed', {
    message: (error as Error).message,
    stack: (error as Error).stack,
  });
  return {
    success: false,
    error: (error as Error).message,
  };
}

  }

  private async analyzeRFP(rfp: any, workflowRunId: string) {
    const content = rfp.documentChunks
      .map((chunk: any) => chunk.content)
      .join('\n\n')
      .substring(0, 5000);

    const daysUntilDeadline = Math.ceil(
      (new Date(rfp.submissionDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const prompt = `
You are a B2B sales analyst. Analyze this RFP and provide strategic assessment.

RFP DETAILS:
- Number: ${rfp.rfpNumber}
- Title: ${rfp.title}
- Issuer: ${rfp.issuer}
- Industry: ${rfp.industry}
- Deadline: ${daysUntilDeadline} days
- Estimated Value: ${rfp.estimatedValue ? '$' + rfp.estimatedValue : 'Not specified'}

DOCUMENT EXCERPT:
${content}

Analyze and return ONLY valid JSON:
{
  "priority": "HIGH|MEDIUM|LOW",
  "strategicValue": 1-10,
  "winProbability": 0-1,
  "recommendations": ["rec1", "rec2"],
  "reasoning": "detailed explanation"
}

Consider:
- Urgency (deadline proximity)
- Contract value
- Strategic fit
- Competition likelihood
- Resource requirements
`;

    const systemPrompt = `You are an expert B2B sales strategist with deep RFP evaluation experience. Be analytical and realistic.`;

    try {
      const result = await this.executeModel(
        prompt,
        'rfp_triage',
        Complexity.MEDIUM,
        systemPrompt,
        0.3,
        1024,
        workflowRunId
      );

      const parsed = JSON.parse(result);

      return {
        priority: parsed.priority as Priority,
        strategicValue: parsed.strategicValue,
        winProbability: parsed.winProbability,
        recommendations: parsed.recommendations,
        reasoning: parsed.reasoning,
      };
    } catch (error) {
  logger.error('RFP analysis failed', {
    message: (error as Error).message,
    stack: (error as Error).stack,
  });

  return {
    priority: Priority.MEDIUM,
    strategicValue: 5,
    winProbability: 0.5,
    recommendations: ['Requires detailed technical review'],
    reasoning: 'Analysis failed, using default values',
  };
}

  }
}

export default SalesAgent;