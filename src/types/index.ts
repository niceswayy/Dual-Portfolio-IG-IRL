export type AgentStatus = "idle" | "running" | "error" | "completed";
export type AgentRole = "orchestrator" | "worker" | "reviewer" | "researcher" | "coder" | "custom";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  model: string;
  systemPrompt: string;
  skills: string[];
  mcpConnections: string[];
  projectId?: string;
  lastActivity?: string;
  tokensUsed: number;
  createdAt: string;
  color: string;
}

export interface MCPServer {
  id: string;
  name: string;
  transport: "stdio" | "sse" | "streamable-http";
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  tools: MCPTool[];
  connected: boolean;
  lastPing?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  prompt: string;
  agentId?: string;
  tools: string[];
  tags: string[];
  createdAt: string;
  runs: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  agents: string[];
  skills: string[];
  notionPageId?: string;
  status: "active" | "paused" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agentId?: string;
  agentName?: string;
  timestamp: string;
  tokens?: number;
  streaming?: boolean;
}

export interface AgentInteraction {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  message: string;
  timestamp: string;
  projectId: string;
}

export interface NotionPage {
  id: string;
  title: string;
  url: string;
  lastSynced: string;
}

export interface StreamEvent {
  type: "token" | "status" | "error" | "done" | "interaction";
  agentId: string;
  data: string;
  timestamp: string;
}
