"use client";

import { Bot, MessageSquare, Zap, AlertCircle } from "lucide-react";
import { useStore } from "@/store";

export default function ActivityFeed() {
  const { agents, messages, interactions } = useStore();

  // Build unified feed from recent messages and interactions
  const feed = [
    ...messages.slice(-10).map((m) => ({
      id: m.id,
      type: "message" as const,
      icon: m.role === "user" ? MessageSquare : Bot,
      title: m.agentName || "User",
      description: m.content.slice(0, 80) + (m.content.length > 80 ? "..." : ""),
      time: m.timestamp,
      color: agents.find((a) => a.id === m.agentId)?.color || "#6366f1",
    })),
    ...interactions.slice(-5).map((i) => {
      const from = agents.find((a) => a.id === i.fromAgentId);
      const to = agents.find((a) => a.id === i.toAgentId);
      return {
        id: i.id,
        type: "interaction" as const,
        icon: Zap,
        title: `${from?.name || "?"} → ${to?.name || "?"}`,
        description: i.message.slice(0, 80),
        time: i.timestamp,
        color: from?.color || "#f59e0b",
      };
    }),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="font-semibold mb-4">Activity Feed</h3>

      {feed.length === 0 ? (
        <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
          <AlertCircle size={24} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No activity yet. Create an agent to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                <item.icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span
                    className="text-xs shrink-0 ml-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {new Date(item.time).toLocaleTimeString()}
                  </span>
                </div>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
