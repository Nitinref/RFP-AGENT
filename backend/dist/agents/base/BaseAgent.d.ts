import { ModelService } from "../../services/ModelService.js";
import { AgentInput, AgentOutput } from "../../types/agents.types.js";
import { AgentType, Complexity } from "@prisma/client";
export declare abstract class BaseAgent {
    protected agentType: AgentType;
    protected modelService: ModelService;
    constructor(agentType: AgentType);
    execute(input: AgentInput): Promise<AgentOutput>;
    protected executeModel(prompt: string, taskType: string, complexity: Complexity, systemPrompt?: string, temperature?: number, maxTokens?: number, workflowRunId?: string, agentActivityId?: string): Promise<string>;
    protected abstract run(input: AgentInput): Promise<AgentOutput>;
}
export default BaseAgent;
