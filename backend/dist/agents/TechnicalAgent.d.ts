import BaseAgent from './base/BaseAgent.js';
import { AgentInput, AgentOutput } from '../types/agents.types.js';
interface TechnicalAgentInput extends AgentInput {
    data: {
        requirements?: any[];
        focusAreas?: string[];
    };
}
export declare class TechnicalAgent extends BaseAgent {
    private fallbackMetrics;
    constructor();
    protected run(input: TechnicalAgentInput): Promise<AgentOutput>;
    private extractRequirementsWithFallback;
    private matchRequirementsToProductsWithFallback;
    private getFallbackRequirements;
    private getFallbackMatches;
    private getSampleMatches;
    private validateNumber;
    private calculateOverallCompliance;
    private identifyCriticalGaps;
    private calculateConfidence;
}
export default TechnicalAgent;
