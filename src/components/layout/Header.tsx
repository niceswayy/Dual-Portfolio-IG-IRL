"use client";

import { Activity, Bell, Settings } from "lucide-react";
import { useStore } from "@/store";

export default function Header({ title }: { title: string }) {
  const { agents } = useStore();
  const running = agents.filter((a) => a.status === "running").length;
  const totalTokens = agents.reduce((sum, a) => sum + a.tokensUsed, 0);

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <h2 className="text-xl font-semibold">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Live metrics */}
        <div className="flex items-center gap-6 mr-4">
          <div className="flex items-center gap-2 text-sm">
            <Activity size={14} style={{ color: "var(--success)" }} />
            <span style={{ color: "var(--text-secondary)" }}>
              {running} running
            </span>
          </div>
          <div className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
            {totalTokens.toLocaleString()} tokens
          </div>
        </div>

        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <Bell size={18} />
        </button>
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
