// ══════════════════════════════════════════════
// CORE TYPES
// ══════════════════════════════════════════════

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

// ══════════════════════════════════════════════
// AUTOMATION TYPES
// ══════════════════════════════════════════════

export type TriggerType =
  | "manual"
  | "schedule"
  | "on_agent_complete"
  | "on_agent_error"
  | "on_project_update"
  | "webhook";

export interface AutomationStep {
  id: string;
  agentId: string;
  skillId?: string;
  input: string; // template: {{prev_output}}, {{trigger_data}}
  order: number;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: TriggerType;
  cronExpression?: string;
  triggerAgentId?: string;
  steps: AutomationStep[];
  enabled: boolean;
  projectId?: string;
  lastRun?: string;
  runCount: number;
  createdAt: string;
}

export interface AutomationRun {
  id: string;
  automationId: string;
  automationName: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  steps: AutomationStepResult[];
  error?: string;
}

export interface AutomationStepResult {
  stepId: string;
  agentId: string;
  agentName: string;
  input: string;
  output: string;
  tokens: number;
  duration: number;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
}

// ══════════════════════════════════════════════
// AUDIT TYPES
// ══════════════════════════════════════════════

export type AuditSeverity = "critical" | "high" | "medium" | "low" | "info" | "pass";
export type AuditCategory =
  | "xss"
  | "csrf"
  | "ssrf"
  | "injection"
  | "auth"
  | "headers"
  | "rate_limit"
  | "cors"
  | "api"
  | "config"
  | "performance"
  | "accessibility"
  | "seo"
  | "responsive"
  | "rendering";

export interface AuditResult {
  id: string;
  category: AuditCategory;
  name: string;
  description: string;
  severity: AuditSeverity;
  details: string;
  recommendation: string;
  autoFixAvailable: boolean;
  endpoint?: string;
  timestamp: string;
}

export interface AuditSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  pass: number;
}

export interface AuditRun {
  id: string;
  type: "security" | "visual" | "full";
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  results: AuditResult[];
  score: number; // 0-100
  summary: AuditSummary;
}

export interface VisualAuditResult {
  id: string;
  category: "performance" | "accessibility" | "seo" | "responsive" | "rendering";
  name: string;
  score: number; // 0-100
  details: VisualAuditDetail[];
  timestamp: string;
}

export interface VisualAuditDetail {
  check: string;
  status: "pass" | "warn" | "fail";
  message: string;
  element?: string;
  suggestion?: string;
}

// ══════════════════════════════════════════════
// TOAST TYPES
// ══════════════════════════════════════════════

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
