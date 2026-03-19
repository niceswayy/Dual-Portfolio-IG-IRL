"use client";

import { Bot, Plug, Zap, FolderKanban } from "lucide-react";
import { useStore } from "@/store";

export default function StatsGrid() {
  const { agents, mcpServers, skills, projects } = useStore();
  const running = agents.filter((a) => a.status === "running").length;
  const connected = mcpServers.filter((m) => m.connected).length;
  const totalTokens = agents.reduce((sum, a) => sum + a.tokensUsed, 0);

  const stats = [
    {
      label: "Agents",
      value: agents.length,
      sub: `${running} running`,
      icon: Bot,
      color: "#6366f1",
    },
    {
      label: "MCP Servers",
      value: mcpServers.length,
      sub: `${connected} connected`,
      icon: Plug,
      color: "#22c55e",
    },
    {
      label: "Skills",
      value: skills.length,
      sub: `${skills.reduce((s, sk) => s + sk.runs, 0)} total runs`,
      icon: Zap,
      color: "#f59e0b",
    },
    {
      label: "Projects",
      value: projects.length,
      sub: `${totalTokens.toLocaleString()} tokens`,
      icon: FolderKanban,
      color: "#ec4899",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${s.color}15`, color: s.color }}
            >
              <s.icon size={20} />
            </div>
            <span className="text-2xl font-bold font-mono">{s.value}</span>
          </div>
          <div className="text-sm font-medium">{s.label}</div>
          <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {s.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
