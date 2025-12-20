import { AgentType, Complexity, RequirementCategory } from '@prisma/client';
import BaseAgent from './base/BaseAgent.js';
import { AgentInput, AgentOutput } from '../types/agents.types.js';
import { SKUMatchResult } from '../types/rfp.types.js';
import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';

interface TechnicalAgentInput extends AgentInput {
  data: {
    requirements?: any[];
    focusAreas?: string[];
  };
}

export class TechnicalAgent extends BaseAgent {
  constructor() {
    super(AgentType.TECHNICAL_SPECIALIST);
  }

  protected async run(input: TechnicalAgentInput): Promise<AgentOutput> {
    logger.info('Technical Agent: Starting technical analysis', {
      rfpId: input.context.rfpId,
    });

    try {
      const rfp = await prisma.rFP.findUnique({
        where: { id: input.context.rfpId },
        include: {
          requirements: true,
          documentChunks: {
            where: {
              sectionType: RequirementCategory.TECHNICAL,
            },
          },
        },
      });

      if (!rfp) {
        throw new Error(`RFP ${input.context.rfpId} not found`);
      }

      let requirements = rfp.requirements;
      if (requirements.length === 0) {
        requirements = await this.extractRequirements(rfp, input.context.workflowRunId);
      }

      const products = await prisma.productSKU.findMany({
        where: { isActive: true },
        include: { pricingTiers: true },
      });

      const matches = await this.matchRequirementsToProducts(
        requirements,
        products,
        input.context.workflowRunId
      );

      const analysis = await prisma.technicalAnalysis.create({
        data: {
          rfpId: input.context.rfpId,
          status: 'COMPLETED',
          overallCompliance: this.calculateOverallCompliance(matches),
          criticalGaps: this.identifyCriticalGaps(matches),
          recommendations: matches as any,
          confidence: this.calculateConfidence(matches),
        },
      });

      for (const match of matches.slice(0, 3)) {
        await prisma.sKUMatch.create({
          data: {
            technicalAnalysisId: analysis.id,
            skuId: match.skuId,
            overallMatchScore: match.matchScore,
            specMatchScore: match.specMatchScore,
            complianceDetails: match.complianceDetails as any,
            gaps: match.gaps,
            risks: match.risks,
            justification: match.justification,
            rank: matches.indexOf(match) + 1,
            isRecommended: matches.indexOf(match) < 3,
            confidence: match.confidence,
          },
        });
      }

      logger.info('Technical Agent: Analysis completed', {
        rfpId: input.context.rfpId,
        matchesFound: matches.length,
        topMatch: matches[0]?.sku,
      });

      return {
        success: true,
        data: {
          analysisId: analysis.id,
          overallCompliance: analysis.overallCompliance,
          topMatches: matches.slice(0, 3),
          criticalGaps: analysis.criticalGaps,
        },
      };
    } catch (error) {
      logger.error('Technical Agent execution failed', { error });
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async extractRequirements(rfp: any, workflowRunId: string): Promise<any[]> {
    const content = rfp.documentChunks
      .map((chunk: any) => chunk.content)
      .join('\n\n');

    const prompt = `
Analyze the following RFP document and extract all technical requirements.

Document Content:
${content.substring(0, 10000)}

Extract technical specifications, standards, certifications, and performance requirements.

Return ONLY a valid JSON array with this structure:
[
  {
    "category": "TECHNICAL|TESTING|COMPLIANCE",
    "section": "string",
    "requirement": "string",
    "specification": "string or null",
    "isMandatory": boolean,
    "quantity": number or null,
    "unit": "string or null",
    "technicalParams": {"key": "value"}
  }
]
`;

    const systemPrompt = `You are a technical specification analyst. Extract requirements with precision. Return ONLY valid JSON array.`;

    try {
      const result = await this.executeModel(
        prompt,
        'requirement_extraction',
        Complexity.HIGH,
        systemPrompt,
        undefined,
        undefined,
        workflowRunId
      );

      const parsed = JSON.parse(result);

      const savedRequirements = [];
      for (const req of parsed) {
        const saved = await prisma.rFPRequirement.create({
          data: {
            rfpId: rfp.id,
            category: req.category,
            section: req.section,
            requirement: req.requirement,
            specification: req.specification,
            isMandatory: req.isMandatory,
            quantity: req.quantity,
            unit: req.unit,
            technicalParams: req.technicalParams,
          },
        });
        savedRequirements.push(saved);
      }

      return savedRequirements;
    } catch (error) {
      logger.error('Requirement extraction failed', { error });
      return [];
    }
  }

  private async matchRequirementsToProducts(
    requirements: any[],
    products: any[],
    workflowRunId: string
  ): Promise<SKUMatchResult[]> {
    const mandatoryReqs = requirements.filter((req) => req.isMandatory);

    const prompt = `
You are a technical product matching specialist. Match RFP requirements to available products.

REQUIREMENTS (Mandatory):
${JSON.stringify(mandatoryReqs.map(r => ({
  requirement: r.requirement,
  specification: r.specification,
  technicalParams: r.technicalParams,
})), null, 2)}

AVAILABLE PRODUCTS:
${JSON.stringify(products.slice(0, 20).map(p => ({
  sku: p.sku,
  name: p.name,
  category: p.category,
  specifications: p.specifications,
  certifications: p.certifications,
  standards: p.standards,
})), null, 2)}

Analyze and return the TOP 3 product matches with detailed reasoning.

Return ONLY a valid JSON array:
[
  {
    "skuId": "string",
    "sku": "string",
    "matchScore": 0-100,
    "specMatchScore": 0-100,
    "complianceDetails": {
      "matchedSpecs": ["spec1", "spec2"],
      "certifications": ["cert1"],
      "standards": ["std1"]
    },
    "gaps": ["gap1", "gap2"],
    "risks": ["risk1"],
    "justification": "detailed reasoning",
    "confidence": 0-1
  }
]
`;

    const systemPrompt = `You are a technical matching expert with deep knowledge of industrial products and specifications. Be precise and thorough.`;

    try {
      const result = await this.executeModel(
        prompt,
        'sku_matching',
        Complexity.CRITICAL,
        systemPrompt,
        undefined,
        undefined,
        workflowRunId
      );

      const matches = JSON.parse(result);
      return matches.sort((a: any, b: any) => b.matchScore - a.matchScore);
    } catch (error) {
      logger.error('SKU matching failed', { error });
      return [];
    }
  }

  private calculateOverallCompliance(matches: SKUMatchResult[]): number {
    if (matches.length === 0) return 0;
    const topMatch = matches[0];
    return topMatch?.matchScore || 0;
  }

  private identifyCriticalGaps(matches: SKUMatchResult[]): string[] {
    if (matches.length === 0) {
      return ['No suitable products found'];
    }

    const topMatch = matches[0];
    if (topMatch.matchScore < 70) {
      return ['Low overall compliance', ...topMatch.gaps];
    }

    return topMatch.gaps.filter((gap) =>
      gap.toLowerCase().includes('mandatory') ||
      gap.toLowerCase().includes('critical')
    );
  }

  private calculateConfidence(matches: SKUMatchResult[]): number {
    if (matches.length === 0) return 0;

    const topMatch = matches[0];
    let confidence = topMatch.matchScore / 100;

    if (topMatch.gaps.length > 0) {
      confidence *= 0.9;
    }

    if (topMatch.risks.length > 0) {
      confidence *= 0.95;
    }

    return Math.max(0, Math.min(1, confidence));
  }
}

export default TechnicalAgent;