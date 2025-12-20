import BaseAgent from './base/BaseAgent.js';
import { AgentInput, AgentOutput } from '../types/agents.types.js';
interface PricingAgentInput extends AgentInput {
    data: {
        skuMatches: any[];
        quantities?: Record<string, number>;
    };
}
export declare class PricingAgent extends BaseAgent {
    constructor();
    protected run(input: PricingAgentInput): Promise<AgentOutput>;
    private calculatePricing;
    private getUnitPrice;
    private estimateAdditionalCosts;
    private assessCompetitiveness;
}
export default PricingAgent;
