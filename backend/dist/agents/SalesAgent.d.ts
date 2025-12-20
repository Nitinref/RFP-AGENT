import BaseAgent from './base/BaseAgent.js';
import { AgentInput, AgentOutput } from '../types/agents.types.js';
export declare class SalesAgent extends BaseAgent {
    constructor();
    protected run(input: AgentInput): Promise<AgentOutput>;
    private analyzeRFP;
}
export default SalesAgent;
