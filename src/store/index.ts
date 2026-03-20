"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Agent,
  MCPServer,
  Skill,
  Project,
  ChatMessage,
  AgentInteraction,
  Automation,
  AutomationRun,
  AuditRun,
  Toast,
} from "@/types";

interface BraincellsStore {
  // ── Agents ──
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;

  // ── MCP Servers ──
  mcpServers: MCPServer[];
  setMcpServers: (servers: MCPServer[]) => void;
  addMcpServer: (server: MCPServer) => void;
  updateMcpServer: (id: string, updates: Partial<MCPServer>) => void;
  removeMcpServer: (id: string) => void;

  // ── Skills ──
  skills: Skill[];
  setSkills: (skills: Skill[]) => void;
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  removeSkill: (id: string) => void;

  // ── Projects ──
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;

  // ── Chat ──
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;

  // ── Interactions ──
  interactions: AgentInteraction[];
  addInteraction: (interaction: AgentInteraction) => void;

  // ── Automations ──
  automations: Automation[];
  addAutomation: (automation: Automation) => void;
  updateAutomation: (id: string, updates: Partial<Automation>) => void;
  removeAutomation: (id: string) => void;

  automationRuns: AutomationRun[];
  addAutomationRun: (run: AutomationRun) => void;
  updateAutomationRun: (id: string, updates: Partial<AutomationRun>) => void;

  // ── Audit ──
  auditRuns: AuditRun[];
  addAuditRun: (run: AuditRun) => void;
  updateAuditRun: (id: string, updates: Partial<AuditRun>) => void;

  // ── Toasts ──
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;

  // ── Active selections ──
  activeAgentId: string | null;
  setActiveAgentId: (id: string | null) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;

  // ── UI ──
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<BraincellsStore>()(
  persist(
    (set) => ({
      // ── Agents ──
      agents: [],
      setAgents: (agents) => set({ agents }),
      addAgent: (agent) => set((s) => ({ agents: [...s.agents, agent] })),
      updateAgent: (id, updates) =>
        set((s) => ({
          agents: s.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
      removeAgent: (id) =>
        set((s) => ({ agents: s.agents.filter((a) => a.id !== id) })),

      // ── MCP ──
      mcpServers: [],
      setMcpServers: (mcpServers) => set({ mcpServers }),
      addMcpServer: (server) =>
        set((s) => ({ mcpServers: [...s.mcpServers, server] })),
      updateMcpServer: (id, updates) =>
        set((s) => ({
          mcpServers: s.mcpServers.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      removeMcpServer: (id) =>
        set((s) => ({ mcpServers: s.mcpServers.filter((m) => m.id !== id) })),

      // ── Skills ──
      skills: [],
      setSkills: (skills) => set({ skills }),
      addSkill: (skill) => set((s) => ({ skills: [...s.skills, skill] })),
      updateSkill: (id, updates) =>
        set((s) => ({
          skills: s.skills.map((sk) =>
            sk.id === id ? { ...sk, ...updates } : sk
          ),
        })),
      removeSkill: (id) =>
        set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) })),

      // ── Projects ──
      projects: [],
      setProjects: (projects) => set({ projects }),
      addProject: (project) =>
        set((s) => ({ projects: [...s.projects, project] })),
      updateProject: (id, updates) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      // ── Chat ──
      messages: [],
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      updateMessage: (id, updates) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      clearMessages: () => set({ messages: [] }),

      // ── Interactions ──
      interactions: [],
      addInteraction: (interaction) =>
        set((s) => ({ interactions: [...s.interactions, interaction] })),

      // ── Automations ──
      automations: [],
      addAutomation: (automation) =>
        set((s) => ({ automations: [...s.automations, automation] })),
      updateAutomation: (id, updates) =>
        set((s) => ({
          automations: s.automations.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),
      removeAutomation: (id) =>
        set((s) => ({ automations: s.automations.filter((a) => a.id !== id) })),

      automationRuns: [],
      addAutomationRun: (run) =>
        set((s) => ({ automationRuns: [...s.automationRuns, run] })),
      updateAutomationRun: (id, updates) =>
        set((s) => ({
          automationRuns: s.automationRuns.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      // ── Audit ──
      auditRuns: [],
      addAuditRun: (run) =>
        set((s) => ({ auditRuns: [...s.auditRuns, run] })),
      updateAuditRun: (id, updates) =>
        set((s) => ({
          auditRuns: s.auditRuns.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      // ── Toasts ──
      toasts: [],
      addToast: (toast) =>
        set((s) => ({ toasts: [...s.toasts, toast] })),
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // ── Active ──
      activeAgentId: null,
      setActiveAgentId: (id) => set({ activeAgentId: id }),
      activeProjectId: null,
      setActiveProjectId: (id) => set({ activeProjectId: id }),

      // ── UI ──
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "braincells-store",
      partialize: (state) => ({
        agents: state.agents,
        mcpServers: state.mcpServers,
        skills: state.skills,
        projects: state.projects,
        automations: state.automations,
        automationRuns: state.automationRuns.slice(-50),
        auditRuns: state.auditRuns.slice(-20),
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
