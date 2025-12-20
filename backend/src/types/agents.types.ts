export interface AgentContext {
  rfpId: string;
  workflowRunId: string;
  stepNumber: number;
  userId?: string;
}

export interface AgentInput {
  context: AgentContext;
  data: Record<string, any>;
}

export interface AgentOutput {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

export interface AgentExecutionResult {
  agentType: string;
  status: 'completed' | 'failed';
  duration: number;
  output?: any;
  error?: string;
}