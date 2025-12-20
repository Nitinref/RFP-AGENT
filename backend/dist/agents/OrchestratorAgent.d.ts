import BaseAgent from './base/BaseAgent.js';
import { AgentInput, AgentOutput } from '../types/agents.types.js';
export declare class OrchestratorAgent extends BaseAgent {
    private salesAgent;
    private technicalAgent;
    private pricingAgent;
    constructor();
    protected run(input: AgentInput): Promise<AgentOutput>;
    private executeSalesAgent;
    private executeTechnicalAgent;
    private executePricingAgent;
    private generateFinalResponse;
}
export default OrchestratorAgent;
