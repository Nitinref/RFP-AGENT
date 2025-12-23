import { AgentType, Complexity, RequirementCategory } from '@prisma/client';
import { ragService } from '../services/RAGService.js';
import BaseAgent from './base/BaseAgent.js';
import { AgentInput, AgentOutput } from '../types/agents.types.js';
import { SKUMatchResult } from '../types/rfp.types.js';
import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';
import { runWithAutoFallback } from "../utils/runWithAutoFallback.js";

interface TechnicalAgentInput extends AgentInput {
  data: {
    requirements?: any[];
    focusAreas?: string[];
  };
}

interface FallbackMetrics {
  extractionUsedFallback: boolean;
  extractionFallbackReason: string | null;
  matchingUsedFallback: boolean;
  matchingFallbackReason: string | null;
}

export class TechnicalAgent extends BaseAgent {
  private fallbackMetrics: FallbackMetrics = {
    extractionUsedFallback: false,
    extractionFallbackReason: null,
    matchingUsedFallback: false,
    matchingFallbackReason: null,
  };

  constructor() {
    super(AgentType.TECHNICAL_SPECIALIST);
  }

  protected async run(input: TechnicalAgentInput): Promise<AgentOutput> {
    logger.info('Technical Agent: Starting technical analysis', {
      rfpId: input.context.rfpId,
    });

    // Reset fallback metrics for each run
    this.fallbackMetrics = {
      extractionUsedFallback: false,
      extractionFallbackReason: null,
      matchingUsedFallback: false,
      matchingFallbackReason: null,
    };

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

      const relevantChunkIds = await ragService.searchRFPChunks(
        input.context.rfpId,
        'technical requirements and specifications'
      );

      const relevantChunks = await prisma.rFPDocumentChunk.findMany({
        where: { id: { in: relevantChunkIds } }
      });


      let requirements = rfp.requirements;
      if (requirements.length === 0) {
        const extractionResult = await this.extractRequirementsWithFallback(rfp, input.context.workflowRunId, relevantChunks
        );
        requirements = extractionResult.requirements;
        this.fallbackMetrics.extractionUsedFallback = extractionResult.usedFallback;
        this.fallbackMetrics.extractionFallbackReason = extractionResult.fallbackReason;
      }

      const products = await prisma.productSKU.findMany({
        where: { isActive: true },
        include: { pricingTiers: true },
      });

      const matchingResult = await this.matchRequirementsToProductsWithFallback(
        requirements,
        products,
        input.context.workflowRunId
      );

      const matches = matchingResult.matches;
      this.fallbackMetrics.matchingUsedFallback = matchingResult.usedFallback;
      this.fallbackMetrics.matchingFallbackReason = matchingResult.fallbackReason;

      // Ensure matches have gaps property
      const safeMatches = matches.map(match => ({
        ...match,
        gaps: Array.isArray(match.gaps) ? match.gaps : [],
        risks: Array.isArray(match.risks) ? match.risks : [],
      }));

      const analysis = await prisma.technicalAnalysis.create({
        data: {
          rfpId: input.context.rfpId,
          status: 'COMPLETED',
          overallCompliance: this.calculateOverallCompliance(safeMatches),
          criticalGaps: this.identifyCriticalGaps(safeMatches),
          recommendations: safeMatches as any,
          confidence: this.calculateConfidence(safeMatches),
          // @ts-ignore
          metadata: {
            fallbackMetrics: this.fallbackMetrics,
            timestamp: new Date().toISOString(),
            requirementsCount: requirements.length,
            productsCount: products.length,
          } as any,
        },
      });

      for (const match of safeMatches.slice(0, 3)) {
        await prisma.sKUMatch.create({
          data: {
            technicalAnalysisId: analysis.id,
            skuId: match.skuId,
            overallMatchScore: match.matchScore,
            specMatchScore: match.specMatchScore,
            complianceDetails: match.complianceDetails as any,
            gaps: Array.isArray(match.gaps) ? match.gaps : [],
            risks: Array.isArray(match.risks) ? match.risks : [],
            justification: match.justification,
            rank: safeMatches.indexOf(match) + 1,
            isRecommended: safeMatches.indexOf(match) < 3,
            confidence: match.confidence,
          },
        });
      }

      logger.info('Technical Agent: Analysis completed', {
        rfpId: input.context.rfpId,
        matchesFound: safeMatches.length,
        topMatch: safeMatches[0]?.sku,
        fallbackMetrics: this.fallbackMetrics,
      });

      return {
        success: true,
        data: {
          analysisId: analysis.id,
          overallCompliance: analysis.overallCompliance,
          topMatches: safeMatches.slice(0, 3),
          criticalGaps: analysis.criticalGaps,
          fallbackMetrics: this.fallbackMetrics,
        },
      };
    } catch (error) {
      logger.error('Technical Agent execution failed', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        rfpId: input.context.rfpId,
      });
      return {
        success: false,
        error: (error as Error).message,
        data: {
          fallbackMetrics: this.fallbackMetrics,
        },
      };
    }
  }

  // ---------------- REQUIREMENT EXTRACTION WITH FALLBACK ----------------

  private async extractRequirementsWithFallback(
    rfp: any,
    workflowRunId: string,
    relevantChunks: any[],
  ): Promise<{ requirements: any[]; usedFallback: boolean; fallbackReason: string | null }> {
    const content = relevantChunks
      .map(c => c.content)
      .join('\n\n');


    const prompt = `
Analyze the following RFP document and extract all technical requirements.

Document Content:
${content.substring(0, 10000)}

Return ONLY a valid JSON array:
[
  {
    "category": "TECHNICAL|TESTING|COMPLIANCE",
    "section": "string",
    "requirement": "string",
    "specification": "string or null",
    "isMandatory": boolean,
    "quantity": number or null,
    "unit": "string or null",
    "technicalParams": { "key": "value" }
  }
]
`;

    const fallbackResult = await runWithAutoFallback({
      primaryCall: async () => {
        const result = await this.executeModel(
          prompt,
          'requirement_extraction',
          Complexity.HIGH,
          'You are a technical specification analyst. Return ONLY valid JSON.',
          undefined,
          undefined,
          workflowRunId
        );

        // Validate the result before returning
        if (!result || result.trim().length < 20) {
          throw new Error('Empty or invalid output from primary model');
        }

        let parsed;
        try {
          parsed = JSON.parse(result);
          if (!Array.isArray(parsed)) {
            throw new Error('Output is not a valid JSON array');
          }
          if (parsed.length === 0) {
            throw new Error('No requirements extracted');
          }
        } catch (err) {
          throw new Error(`Invalid JSON output: ${(err as Error).message}`);
        }

        return {
          result: parsed,
          confidence: 0.8, // You could calculate this based on parsing success
        };
      },
      fallbackCall: async () => {
        logger.warn('Using fallback for requirement extraction', { rfpId: rfp.id });

        // Fallback: Use a simpler, more deterministic extraction
        const fallbackRequirements = this.getFallbackRequirements(rfp);

        return {
          result: fallbackRequirements,
          confidence: 0.6, // Lower confidence for fallback
        };
      },
      confidenceThreshold: 0.7
    });

    const requirements = fallbackResult.result.result;
    const usedFallback = fallbackResult.fallbackUsed;
    const fallbackReason = fallbackResult.fallbackReason;

    // Save requirements to database
    const saved = [];
    for (const req of requirements) {
      try {
        const savedReq = await prisma.rFPRequirement.create({
          data: {
            rfpId: rfp.id,
            category: req.category || "TECHNICAL",
            section: req.section || "General",
            requirement: req.requirement,
            specification: req.specification || null,
            isMandatory: req.isMandatory !== undefined ? req.isMandatory : true,
            quantity: req.quantity || null,
            unit: req.unit || null,
            technicalParams: req.technicalParams || {},
          },
        });
        saved.push(savedReq);
      } catch (error) {
        logger.error('Failed to save requirement', {
          requirement: req,
          error: (error as Error).message,
        });
      }
    }

    logger.info('Requirements extracted', {
      count: saved.length,
      usedFallback,
      fallbackReason,
    });

    return {
      requirements: saved,
      usedFallback,
      fallbackReason,
    };
  }

  // ---------------- SKU MATCHING WITH FALLBACK ----------------

  private async matchRequirementsToProductsWithFallback(
    requirements: any[],
    products: any[],
    workflowRunId: string
  ): Promise<{ matches: SKUMatchResult[]; usedFallback: boolean; fallbackReason: string | null }> {
    // If no products in database, return sample matches
    if (!products || products.length === 0) {
      logger.warn('No products found in database, returning sample matches');
      return {
        matches: this.getSampleMatches(),
        usedFallback: true,
        fallbackReason: 'No products in database',
      };
    }

    const mandatoryReqs = requirements.filter((r) => r.isMandatory);
    const reqsToUse = mandatoryReqs.length > 0 ? mandatoryReqs : requirements.slice(0, 5);

    const prompt = `
Match RFP technical requirements to products.

REQUIREMENTS:
${JSON.stringify(reqsToUse, null, 2)}

PRODUCTS:
${JSON.stringify(products.slice(0, 20), null, 2)}

Return ONLY a valid JSON array of matches. Format:
[
  {
    "skuId": "string",
    "sku": "string",
    "matchScore": number,
    "specMatchScore": number,
    "complianceDetails": { "key": "value" },
    "gaps": ["string"],
    "risks": ["string"],
    "justification": "string",
    "confidence": number
  }
]
NEVER return an empty array. Return at least one match.
`;

    const fallbackResult = await runWithAutoFallback({
      primaryCall: async () => {
        const result = await this.executeModel(
          prompt,
          'sku_matching',
          Complexity.CRITICAL,
          'You are a technical product matching expert. Return ONLY valid JSON.',
          undefined,
          undefined,
          workflowRunId
        );

        if (!result || result.trim().length < 20) {
          throw new Error('Empty or invalid output from primary model');
        }

        let matches: any[];
        try {
          matches = JSON.parse(result);
          if (!Array.isArray(matches)) {
            throw new Error('Output is not a valid JSON array');
          }
          if (matches.length === 0) {
            throw new Error('No matches found');
          }
        } catch (err) {
          throw new Error(`Invalid JSON output: ${(err as Error).message}`);
        }

        // Validate each match
        const validatedMatches = matches.map(match => ({
          skuId: match.skuId || 'unknown',
          sku: match.sku || 'Unknown Product',
          matchScore: this.validateNumber(match.matchScore, 70),
          specMatchScore: this.validateNumber(match.specMatchScore, 70),
          complianceDetails: match.complianceDetails || {},
          gaps: Array.isArray(match.gaps) ? match.gaps : [],
          risks: Array.isArray(match.risks) ? match.risks : [],
          justification: match.justification || 'AI-matched based on requirements',
          confidence: this.validateNumber(match.confidence, 0.7, 0, 1),
        }));

        const topMatchScore = validatedMatches[0]?.matchScore || 0;

        return {
          result: validatedMatches,
          confidence: topMatchScore / 100,
        };
      },
      fallbackCall: async () => {
        logger.warn('Using fallback for SKU matching', {
          requirementCount: requirements.length,
          productCount: products.length,
        });

        const fallbackMatches = this.getFallbackMatches(requirements, products);

        return {
          result: fallbackMatches,
          confidence: 0.6, // Lower confidence for fallback
        };
      },
      confidenceThreshold: 0.65
    });

    const matches = fallbackResult.result.result;
    const usedFallback = fallbackResult.fallbackUsed;
    const fallbackReason = fallbackResult.fallbackReason;

    // Sort by match score
    const sortedMatches = matches.sort((a: { matchScore: number; }, b: { matchScore: number; }) => b.matchScore - a.matchScore);

    logger.info('SKU matching completed', {
      matchesFound: sortedMatches.length,
      topScore: sortedMatches[0]?.matchScore,
      usedFallback,
      fallbackReason,
    });

    return {
      matches: sortedMatches,
      usedFallback,
      fallbackReason,
    };
  }

  // ---------------- FALLBACK IMPLEMENTATIONS ----------------

  private getFallbackRequirements(rfp: any): any[] {
    // Simple fallback: extract key phrases from document
    const content = rfp.documentChunks.map((c: any) => c.content).join('\n\n');

    // Look for common requirement indicators
    const requirementIndicators = [
      'must', 'shall', 'required', 'need', 'necessary',
      'comply with', 'meet', 'adhere to', 'standard', 'specification'
    ];

    const lines = content.split('\n');
    const requirements = [];

    for (const line of lines) {
      if (requirementIndicators.some(indicator => line.toLowerCase().includes(indicator))) {
        requirements.push({
          category: "TECHNICAL",
          section: "General",
          requirement: line.trim().substring(0, 200),
          specification: null,
          isMandatory: true,
          quantity: 1,
          unit: null,
          technicalParams: {}
        });
      }

      if (requirements.length >= 5) break; // Limit fallback to 5 requirements
    }

    // If no requirements found with indicators, create a default one
    if (requirements.length === 0) {
      requirements.push({
        category: "TECHNICAL",
        section: "General",
        requirement: "Basic technical requirements for " + (rfp.title || "the project"),
        specification: "Standard technical specifications apply",
        isMandatory: true,
        quantity: 1,
        unit: "system",
        technicalParams: {}
      });
    }

    return requirements;
  }

  private getFallbackMatches(requirements: any[], products: any[]): SKUMatchResult[] {
    if (!products || products.length === 0) {
      return this.getSampleMatches();
    }

    // Simple fallback matching: pick first 3 products
    const fallbackMatches = products.slice(0, 3).map((product, index) => ({
      skuId: product.id || `fallback_${index + 1}`,
      sku: product.name || `Fallback Product ${index + 1}`,
      matchScore: 70 - (index * 10), // Decreasing scores
      specMatchScore: 65 - (index * 10),
      complianceDetails: {
        fallback: true,
        matchType: 'fallback_simple',
        requirementCount: requirements.length,
      },
      gaps: ['Match performed using fallback logic'],
      risks: ['Limited confidence in match accuracy'],
      justification: 'Fallback matching due to primary model limitations',
      confidence: 0.6 - (index * 0.1),
    }));
    // @ts-ignore
    return fallbackMatches;
  }

  // ---------------- SAMPLE DATA FOR TESTING ----------------

  private getSampleMatches(): SKUMatchResult[] {
    return [
      {
        skuId: 'sku_001',
        sku: 'Industrial Automation Starter Kit',
        matchScore: 85,
        specMatchScore: 80,
        complianceDetails: {
          // @ts-ignore
          technical: 90,
          features: 80,
          compatibility: 85,
          sample: true,
        },
        gaps: ['Requires additional sensors', 'Needs custom configuration'],
        risks: ['Long lead time', 'Requires on-site installation'],
        justification: 'Matches 85% of technical requirements for industrial automation systems',
        confidence: 0.85
      },
      {
        skuId: 'sku_002',
        sku: 'Sensor Package S500',
        matchScore: 75,
        specMatchScore: 70,
        complianceDetails: {
          // @ts-ignore
          technical: 75,
          features: 70,
          compatibility: 80,
          sample: true,
        },
        gaps: ['Missing temperature sensors', 'Limited range'],
        risks: ['Partial compliance', 'May need additional components'],
        justification: 'Covers basic sensor requirements with 75% match',
        confidence: 0.75
      },
      {
        skuId: 'sku_003',
        sku: 'PLC Controller P500',
        matchScore: 65,
        specMatchScore: 60,
        complianceDetails: {
          // @ts-ignore
          technical: 65,
          features: 60,
          compatibility: 70,
          sample: true,
        },
        gaps: ['Limited I/O capacity', 'No redundancy features'],
        risks: ['May not scale', 'Limited support'],
        justification: 'Basic controller with 65% match to requirements',
        confidence: 0.65
      }
    ];
  }

  // ---------------- HELPERS ----------------

  private validateNumber(value: any, defaultValue: number, min: number = 0, max: number = 100): number {
    const num = Number(value);
    if (isNaN(num)) {
      return defaultValue;
    }
    return Math.max(min, Math.min(max, num));
  }

  private calculateOverallCompliance(matches: SKUMatchResult[]): number {
    return matches.length > 0 ? matches[0].matchScore : 0;
  }

  private identifyCriticalGaps(matches: SKUMatchResult[]): string[] {
    if (!matches || matches.length === 0) {
      return ['No suitable products found'];
    }

    const top = matches[0];
    const gaps = Array.isArray(top.gaps) ? top.gaps : [];

    if (top.matchScore < 70) {
      return ['Low compliance: Match score below 70%', ...gaps];
    }

    return gaps.length > 0 ? gaps : ['No critical gaps identified'];
  }

  private calculateConfidence(matches: SKUMatchResult[]): number {
    if (!matches || matches.length === 0) return 0;

    let confidence = matches[0].matchScore / 100;

    const gaps = Array.isArray(matches[0].gaps) ? matches[0].gaps : [];
    const risks = Array.isArray(matches[0].risks) ? matches[0].risks : [];

    if (gaps.length > 0) confidence *= 0.9;
    if (risks.length > 0) confidence *= 0.95;

    return Math.max(0, Math.min(1, confidence));
  }
}

export default TechnicalAgent;