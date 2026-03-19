"use client";

import { Plug, Trash2, RefreshCw, Wrench } from "lucide-react";
import type { MCPServer } from "@/types";
import { useStore } from "@/store";

interface MCPServerCardProps {
  server: MCPServer;
  onEdit: (server: MCPServer) => void;
}

export default function MCPServerCard({ server, onEdit }: MCPServerCardProps) {
  const { removeMcpServer, updateMcpServer } = useStore();

  const reconnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/mcp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: server.id, action: "connect" }),
      });
      if (res.ok) {
        const data = await res.json();
        updateMcpServer(server.id, {
          connected: true,
          tools: data.tools || [],
          lastPing: new Date().toISOString(),
        });
      }
    } catch {
      updateMcpServer(server.id, { connected: false });
    }
  };

  return (
    <div className="glass rounded-xl p-5 card-hover cursor-pointer" onClick={() => onEdit(server)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              server.connected ? "glow-success" : ""
            }`}
            style={{
              background: server.connected
                ? "rgba(34, 197, 94, 0.15)"
                : "var(--bg-tertiary)",
              color: server.connected ? "var(--success)" : "var(--text-secondary)",
            }}
          >
            <Plug size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{server.name}</h3>
            <span
              className="text-xs font-mono"
              style={{ color: "var(--text-secondary)" }}
            >
              {server.transport}
            </span>
          </div>
        </div>
        <div className={`status-dot ${server.connected ? "running" : "idle"}`} />
      </div>

      {/* URL / Command */}
      <div
        className="text-xs font-mono p-2 rounded mb-3 truncate"
        style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
      >
        {server.url || server.command || "No endpoint configured"}
      </div>

      {/* Tools */}
      <div className="flex items-center gap-2 mb-3">
        <Wrench size={12} style={{ color: "var(--text-secondary)" }} />
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {server.tools.length} tools available
        </span>
      </div>

      {server.tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {server.tools.slice(0, 4).map((t) => (
            <span
              key={t.name}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                color: "var(--success)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              {t.name}
            </span>
          ))}
          {server.tools.length > 4 && (
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              +{server.tools.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div
        className="flex items-center gap-2 pt-3 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={reconnect}
          className="btn btn-ghost text-xs flex-1"
        >
          <RefreshCw size={12} />
          {server.connected ? "Reconnect" : "Connect"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeMcpServer(server.id);
          }}
          className="btn btn-danger text-xs px-2"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
