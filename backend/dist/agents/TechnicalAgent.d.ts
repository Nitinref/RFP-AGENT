import BaseAgent from './base/BaseAgent.js';
import { AgentInput, AgentOutput } from '../types/agents.types.js';
interface TechnicalAgentInput extends AgentInput {
    data: {
        requirements?: any[];
        focusAreas?: string[];
    };
}
export declare class TechnicalAgent extends BaseAgent {
    constructor();
    protected run(input: TechnicalAgentInput): Promise<AgentOutput>;
    private extractRequirements;
    private matchRequirementsToProducts;
    private getSampleMatches;
    private calculateOverallCompliance;
    private identifyCriticalGaps;
    private calculateConfidence;
}
export default TechnicalAgent;
