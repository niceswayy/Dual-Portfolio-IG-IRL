"use client";

import { Bot, Play, Square, Trash2, MessageSquare } from "lucide-react";
import type { Agent } from "@/types";
import StatusBadge from "@/components/shared/StatusBadge";
import { useStore } from "@/store";

interface AgentCardProps {
  agent: Agent;
  onChat: (id: string) => void;
  onEdit: (agent: Agent) => void;
}

export default function AgentCard({ agent, onChat, onEdit }: AgentCardProps) {
  const { updateAgent, removeAgent } = useStore();

  const toggleRun = () => {
    updateAgent(agent.id, {
      status: agent.status === "running" ? "idle" : "running",
      lastActivity: new Date().toISOString(),
    });
  };

  return (
    <div
      className="glass rounded-xl p-5 card-hover cursor-pointer"
      onClick={() => onEdit(agent)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${agent.color}20`, color: agent.color }}
          >
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{agent.name}</h3>
            <span
              className="text-xs capitalize"
              style={{ color: "var(--text-secondary)" }}
            >
              {agent.role}
            </span>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Model */}
      <div
        className="text-xs font-mono mb-3 px-2 py-1 rounded inline-block"
        style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
      >
        {agent.model}
      </div>

      {/* Skills */}
      {agent.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {agent.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: `${agent.color}15`,
                color: agent.color,
                border: `1px solid ${agent.color}30`,
              }}
            >
              {s}
            </span>
          ))}
          {agent.skills.length > 3 && (
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              +{agent.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div
        className="flex items-center justify-between text-xs pt-3 border-t"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        <span>{agent.tokensUsed.toLocaleString()} tokens</span>
        <span>{agent.mcpConnections.length} MCP</span>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-2 mt-3 pt-3 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleRun();
          }}
          className="btn btn-ghost text-xs flex-1"
        >
          {agent.status === "running" ? (
            <>
              <Square size={12} /> Stop
            </>
          ) : (
            <>
              <Play size={12} /> Run
            </>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChat(agent.id);
          }}
          className="btn btn-primary text-xs flex-1"
        >
          <MessageSquare size={12} /> Chat
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeAgent(agent.id);
          }}
          className="btn btn-danger text-xs px-2"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
