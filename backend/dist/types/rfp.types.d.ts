export interface SKUMatchResult {
    skuId: string;
    sku: string;
    matchScore: number;
    specMatchScore: number;
    complianceDetails: {
        matchedSpecs: string[];
        certifications: string[];
        standards: string[];
    };
    gaps: string[];
    risks: string[];
    justification: string;
    confidence: number;
    quantity?: number;
    category?: string;
}
export interface PricingBreakdown {
    productsCost: number;
    testingCost?: number;
    logisticsCost?: number;
    complianceCost?: number;
    contingency?: number;
    totalBidPrice: number;
    assumptions: string[];
    risks: string[];
}
export interface RFPAnalysisResult {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    strategicValue: number;
    winProbability: number;
    recommendations: string[];
    reasoning: string;
}
