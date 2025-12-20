import { AgentType, Complexity, WorkflowStatus } from '@prisma/client';
import BaseAgent from './base/BaseAgent.js';
import { AgentInput, AgentOutput } from '../types/agents.types.js';
import SalesAgent from './SalesAgent.js';
import TechnicalAgent from './TechnicalAgent.js';
import PricingAgent from './PricingAgent.js';
import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';

export class OrchestratorAgent extends BaseAgent {
  private salesAgent: SalesAgent;
  private technicalAgent: TechnicalAgent;
  private pricingAgent: PricingAgent;

  constructor() {
    super(AgentType.ORCHESTRATOR);
    this.salesAgent = new SalesAgent();
    this.technicalAgent = new TechnicalAgent();
    this.pricingAgent = new PricingAgent();
  }

  protected async run(input: AgentInput): Promise<AgentOutput> {
    logger.info('Orchestrator Agent: Starting workflow orchestration', {
      rfpId: input.context.rfpId,
      workflowRunId: input.context.workflowRunId,
    });

    try {
      // Step 1: Sales Triage
      const salesResult = await this.executeSalesAgent(input);
      if (!salesResult.success) {
        throw new Error('Sales Agent failed: ' + salesResult.error);
      }

      // Step 2: Technical Analysis (parallel execution possible)
      const technicalResult = await this.executeTechnicalAgent(input);
      if (!technicalResult.success) {
        throw new Error('Technical Agent failed: ' + technicalResult.error);
      }

      // Step 3: Pricing Analysis
      const pricingInput = {
        ...input,
        context: { ...input.context, stepNumber: 3 },
        data: {
          //@ts-ignore
          skuMatches: technicalResult.data.topMatches,
        },
      };
      const pricingResult = await this.executePricingAgent(pricingInput);
      if (!pricingResult.success) {
        throw new Error('Pricing Agent failed: ' + pricingResult.error);
      }

      // Step 4: Generate Final Response
      const finalResponse = await this.generateFinalResponse(
        input.context.rfpId,
        salesResult.data,
        technicalResult.data,
        pricingResult.data,
        input.context.workflowRunId
      );

      logger.info('Orchestrator Agent: Workflow completed successfully', {
        rfpId: input.context.rfpId,
        responseId: finalResponse.id,
      });

      return {
        success: true,
        data: {
          salesAnalysis: salesResult.data,
          technicalAnalysis: technicalResult.data,
          pricingAnalysis: pricingResult.data,
          finalResponse,
        },
      };
    } catch (error) {
      logger.error('Orchestrator Agent execution failed', { error });
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async executeSalesAgent(input: AgentInput): Promise<AgentOutput> {
    return this.salesAgent.execute({
      ...input,
      context: { ...input.context, stepNumber: 1 },
    });
  }

  private async executeTechnicalAgent(input: AgentInput): Promise<AgentOutput> {
    return this.technicalAgent.execute({
      ...input,
      context: { ...input.context, stepNumber: 2 },
      data: {},
    });
  }

  private async executePricingAgent(input: AgentInput): Promise<AgentOutput> {
    return this.pricingAgent.execute(input);
  }

  private async generateFinalResponse(
    rfpId: string,
    salesData: any,
    technicalData: any,
    pricingData: any,
    workflowRunId: string
  ) {
    const rfp = await prisma.rFP.findUnique({
      where: { id: rfpId },
    });

    if (!rfp) {
      throw new Error(`RFP ${rfpId} not found`);
    }

    const prompt = `
You are an enterprise RFP response writer. Generate a professional, submission-ready RFP response.

RFP DETAILS:
- Number: ${rfp.rfpNumber}
- Title: ${rfp.title}
- Issuer: ${rfp.issuer}
- Industry: ${rfp.industry}

SALES ANALYSIS:
${JSON.stringify(salesData, null, 2)}

TECHNICAL ANALYSIS:
${JSON.stringify(technicalData, null, 2)}

PRICING ANALYSIS:
${JSON.stringify(pricingData, null, 2)}

Generate a comprehensive response with:
1. Executive Summary (2-3 paragraphs)
2. Compliance Statement
3. Delivery Timeline
4. Payment Terms

Return ONLY valid JSON:
{
  "executiveSummary": "string",
  "complianceStatement": "string",
  "deliveryTimeline": "string",
  "paymentTerms": "string",
  "validityPeriod": number (days),
  "keyHighlights": ["highlight1", "highlight2"]
}
`;

    const systemPrompt = `You are an expert B2B proposal writer with deep RFP experience. Write professionally and persuasively.`;

    try {
      const result = await this.executeModel(
        prompt,
        'response_generation',
        Complexity.HIGH,
        systemPrompt,
        0.4,
        2048,
        workflowRunId
      );

      const parsed = JSON.parse(result);

      const response = await prisma.rFPResponse.create({
        data: {
          rfpId,
          version: 1,
          status: 'DRAFT',
          executiveSummary: parsed.executiveSummary,
          complianceStatement: parsed.complianceStatement,
          totalPrice: pricingData.pricing.totalBidPrice,
          currency: 'USD',
          validityPeriod: parsed.validityPeriod,
          paymentTerms: parsed.paymentTerms,
          deliveryTimeline: parsed.deliveryTimeline,
        },
      });

      // Create response items from top matches
      for (const match of technicalData.topMatches.slice(0, 3)) {
        await prisma.rFPResponseItem.create({
          data: {
            responseId: response.id,
            skuId: match.skuId,
            lineNumber: technicalData.topMatches.indexOf(match) + 1,
            description: match.sku,
            quantity: 1,
            unitPrice: pricingData.pricing.productsCost / technicalData.topMatches.length,
            totalPrice: pricingData.pricing.productsCost / technicalData.topMatches.length,
            complianceNotes: match.justification,
            certifications: match.complianceDetails.certifications || [],
          },
        });
      }

      return response;
    } catch (error) {
      logger.error('Response generation failed', { error });
      throw error;
    }
  }
}

export default OrchestratorAgent;