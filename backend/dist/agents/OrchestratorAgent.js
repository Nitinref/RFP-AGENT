import { AgentType, Complexity } from '@prisma/client';
import BaseAgent from './base/BaseAgent.js';
import SalesAgent from './SalesAgent.js';
import TechnicalAgent from './TechnicalAgent.js';
import PricingAgent from './PricingAgent.js';
import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';
import { safeJsonParse } from "../utils/safeJsonParse.js";
export class OrchestratorAgent extends BaseAgent {
    salesAgent;
    technicalAgent;
    pricingAgent;
    constructor() {
        super(AgentType.ORCHESTRATOR);
        this.salesAgent = new SalesAgent();
        this.technicalAgent = new TechnicalAgent();
        this.pricingAgent = new PricingAgent();
    }
    async run(input) {
        logger.info('Orchestrator Agent: Starting workflow orchestration', {
            rfpId: input.context.rfpId,
            workflowRunId: input.context.workflowRunId,
        });
        try {
            // ─────────────────────────────────────────────
            // Step 1: Sales Triage
            // ─────────────────────────────────────────────
            const salesResult = await this.executeSalesAgent(input);
            if (!salesResult.success) {
                throw new Error('Sales Agent failed: ' + salesResult.error);
            }
            // ─────────────────────────────────────────────
            // Step 2: Technical Analysis
            // ─────────────────────────────────────────────
            const technicalResult = await this.executeTechnicalAgent(input);
            if (!technicalResult.success) {
                throw new Error('Technical Agent failed: ' + technicalResult.error);
            }
            // 🛑 HARD BUSINESS STOP: No SKU matches → STOP workflow
            if (!technicalResult.data?.topMatches ||
                technicalResult.data.topMatches.length === 0) {
                throw new Error('Workflow stopped: No suitable SKUs found for this RFP');
            }
            // ─────────────────────────────────────────────
            // Step 3: Pricing Analysis
            // ─────────────────────────────────────────────
            const pricingInput = {
                ...input,
                context: { ...input.context, stepNumber: 3 },
                data: {
                    ...input.data,
                    skuMatches: technicalResult.data.topMatches,
                },
            };
            const pricingResult = await this.executePricingAgent(pricingInput);
            if (!pricingResult.success) {
                throw new Error('Pricing Agent failed: ' + pricingResult.error);
            }
            // ─────────────────────────────────────────────
            // Step 4: Generate Final Response
            // ─────────────────────────────────────────────
            const finalResponse = await this.generateFinalResponse(input.context.rfpId, salesResult.data, technicalResult.data, pricingResult.data, input.context.workflowRunId);
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
        }
        catch (error) {
            logger.error('Orchestrator Agent execution failed', {
                message: error.message,
                stack: error.stack,
            });
            return {
                success: false,
                error: error.message,
            };
        }
    }
    // ─────────────────────────────────────────────
    // Agent Execution Helpers
    // ─────────────────────────────────────────────
    async executeSalesAgent(input) {
        return this.salesAgent.execute({
            ...input,
            context: { ...input.context, stepNumber: 1 },
        });
    }
    async executeTechnicalAgent(input) {
        return this.technicalAgent.execute({
            ...input,
            context: { ...input.context, stepNumber: 2 },
            data: {
                ...input.data, // ✅ DO NOT wipe data
            },
        });
    }
    async executePricingAgent(input) {
        return this.pricingAgent.execute(input);
    }
    // ─────────────────────────────────────────────
    // Final Response Generation
    // ─────────────────────────────────────────────
    async generateFinalResponse(rfpId, salesData, technicalData, pricingData, workflowRunId) {
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

Return ONLY valid JSON:
{
  "executiveSummary": "string",
  "complianceStatement": "string",
  "deliveryTimeline": "string",
  "paymentTerms": "string",
  "validityPeriod": number,
  "keyHighlights": ["highlight1", "highlight2"]
}
`;
        const result = await this.executeModel(prompt, 'response_generation', Complexity.HIGH, 'You are an expert B2B proposal writer.', 0.4, 2048, workflowRunId);
        const parsed = safeJsonParse(result);
        if (!parsed) {
            logger.warn("Invalid JSON from Gemini, using fallback final response");
            const response = await prisma.rFPResponse.create({
                data: {
                    rfpId,
                    version: 1,
                    status: 'DRAFT',
                    executiveSummary: "Proposal generated using fallback response due to AI formatting issue.",
                    complianceStatement: "Compliance analysis completed with partial AI assistance.",
                    totalPrice: pricingData.pricing.totalBidPrice,
                    currency: 'USD',
                    validityPeriod: 30,
                    paymentTerms: "Net 30",
                    deliveryTimeline: "As per agreed schedule",
                },
            });
            return response;
        }
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
        return response;
    }
}
export default OrchestratorAgent;
//# sourceMappingURL=OrchestratorAgent.js.map