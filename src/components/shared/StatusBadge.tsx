"use client";

import type { AgentStatus } from "@/types";

export default function StatusBadge({ status }: { status: AgentStatus }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`status-dot ${status}`} />
      <span
        className="text-xs font-medium capitalize"
        style={{ color: "var(--text-secondary)" }}
      >
        {status}
      </span>
    </div>
  );
}
