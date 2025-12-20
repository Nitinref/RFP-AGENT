import { prisma } from "../prisma/index.js";
import BaseAgent from './base/BaseAgent.js';
import { logger } from '../utils/logger.js';
import { AgentType, Complexity } from "@prisma/client";
export class PricingAgent extends BaseAgent {
    constructor() {
        super(AgentType.PRICING_SPECIALIST);
    }
    async run(input) {
        logger.info('Pricing Agent: Starting pricing analysis', {
            rfpId: input.context.rfpId,
        });
        try {
            const { skuMatches } = input.data;
            if (!skuMatches || skuMatches.length === 0) {
                throw new Error('No SKU matches provided for pricing');
            }
            const pricingBreakdown = await this.calculatePricing(skuMatches, input.context.workflowRunId);
            const analysis = await prisma.pricingAnalysis.create({
                data: {
                    rfpId: input.context.rfpId,
                    status: 'COMPLETED',
                    totalBidPrice: pricingBreakdown.totalBidPrice,
                    productsCost: pricingBreakdown.productsCost,
                    testingCost: pricingBreakdown.testingCost,
                    logisticsCost: pricingBreakdown.logisticsCost,
                    complianceCost: pricingBreakdown.complianceCost,
                    contingency: pricingBreakdown.contingency,
                    assumptions: pricingBreakdown.assumptions,
                    pricingRisks: pricingBreakdown.risks,
                    competitiveness: this.assessCompetitiveness(pricingBreakdown),
                },
            });
            logger.info('Pricing Agent: Analysis completed', {
                rfpId: input.context.rfpId,
                totalBidPrice: pricingBreakdown.totalBidPrice,
            });
            return {
                success: true,
                data: {
                    analysisId: analysis.id,
                    pricing: pricingBreakdown,
                    competitiveness: analysis.competitiveness,
                },
            };
        }
        catch (error) {
            logger.error('Pricing Agent execution failed', { error });
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async calculatePricing(skuMatches, workflowRunId) {
        let productsCost = 0;
        const assumptions = [];
        const risks = [];
        for (const match of skuMatches.slice(0, 3)) {
            const product = await prisma.productSKU.findUnique({
                where: { id: match.skuId },
                include: { pricingTiers: true },
            });
            if (product) {
                const quantity = match.quantity || 1;
                const unitPrice = this.getUnitPrice(product, quantity);
                productsCost += unitPrice * quantity;
                assumptions.push(`${product.sku}: ${quantity} units @ $${unitPrice.toFixed(2)}/unit`);
            }
        }
        const additionalCosts = await this.estimateAdditionalCosts(skuMatches, productsCost, workflowRunId);
        const totalBidPrice = productsCost +
            (additionalCosts.testing || 0) +
            (additionalCosts.logistics || 0) +
            (additionalCosts.compliance || 0) +
            (additionalCosts.contingency || 0);
        return {
            productsCost,
            testingCost: additionalCosts.testing,
            logisticsCost: additionalCosts.logistics,
            complianceCost: additionalCosts.compliance,
            contingency: additionalCosts.contingency,
            totalBidPrice,
            assumptions: [...assumptions, ...additionalCosts.assumptions],
            risks: [...risks, ...additionalCosts.risks],
        };
    }
    getUnitPrice(product, quantity) {
        const applicableTier = product.pricingTiers
            .filter((tier) => {
            return (quantity >= tier.minQuantity &&
                (!tier.maxQuantity || quantity <= tier.maxQuantity));
        })
            .sort((a, b) => b.minQuantity - a.minQuantity)[0];
        if (applicableTier) {
            return parseFloat(applicableTier.unitPrice.toString());
        }
        return parseFloat(product.basePrice.toString());
    }
    async estimateAdditionalCosts(skuMatches, productsCost, workflowRunId) {
        const prompt = `
You are a B2B pricing specialist. Estimate additional costs for this RFP bid.

PRODUCTS COST: $${productsCost.toFixed(2)}

PRODUCTS OVERVIEW:
${JSON.stringify(skuMatches.slice(0, 3).map(m => ({
            sku: m.sku,
            category: m.category,
            certifications: m.complianceDetails?.certifications || [],
        })), null, 2)}

Estimate realistic costs for:
1. Testing & Quality Assurance (if required by certifications)
2. Logistics & Shipping
3. Compliance & Documentation
4. Contingency (5-10% of total)

Return ONLY valid JSON:
{
  "testing": number or null,
  "logistics": number or null,
  "compliance": number or null,
  "contingency": number,
  "assumptions": ["assumption1", "assumption2"],
  "risks": ["risk1", "risk2"]
}
`;
        const systemPrompt = `You are an expert pricing analyst with deep B2B experience. Be conservative and realistic.`;
        try {
            const result = await this.executeModel(prompt, 'cost_estimation', Complexity.MEDIUM, systemPrompt, undefined, undefined, workflowRunId);
            return JSON.parse(result);
        }
        catch (error) {
            logger.error('Additional cost estimation failed', { error });
            return {
                contingency: productsCost * 0.1,
                assumptions: ['Used 10% contingency due to estimation uncertainty'],
                risks: ['Additional costs may vary based on actual requirements'],
            };
        }
    }
    assessCompetitiveness(pricing) {
        const margin = pricing.contingency || 0;
        const marginPercent = (margin / pricing.totalBidPrice) * 100;
        if (marginPercent > 15)
            return 'HIGH';
        if (marginPercent > 8)
            return 'MEDIUM';
        return 'LOW';
    }
}
export default PricingAgent;
//# sourceMappingURL=PricingAgent.js.map