"use client";

import { useState } from "react";
import { Download, Filter } from "lucide-react";
import type { AuditResult, AuditSeverity } from "@/types";

interface AuditLogsProps {
  results: AuditResult[];
}

const SEVERITY_COLORS: Record<AuditSeverity, string> = {
  critical: "#991b1b",
  high: "#ef4444",
  medium: "#f97316",
  low: "#f59e0b",
  info: "#3b82f6",
  pass: "#22c55e",
};

export default function AuditLogs({ results }: AuditLogsProps) {
  const [filter, setFilter] = useState<AuditSeverity | "all">("all");

  const filtered = filter === "all"
    ? results
    : results.filter((r) => r.severity === filter);

  const exportLogs = () => {
    const json = JSON.stringify(results, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `braincells-audit-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Audit Logs</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter size={12} style={{ color: "var(--text-secondary)" }} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as AuditSeverity | "all")}
              className="text-xs py-1 px-2"
            >
              <option value="all">All ({results.length})</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
              <option value="pass">Pass</option>
            </select>
          </div>
          <button onClick={exportLogs} className="btn btn-ghost text-xs px-2">
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      <div
        className="font-mono text-xs rounded-lg p-3 max-h-[400px] overflow-auto space-y-1"
        style={{ background: "var(--bg-primary)" }}
      >
        {filtered.length === 0 ? (
          <div style={{ color: "var(--text-secondary)" }}>No results to display</div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="flex gap-2 py-1 border-b" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--text-secondary)" }}>
                {new Date(r.timestamp).toLocaleTimeString()}
              </span>
              <span
                className="uppercase font-bold w-16 text-right"
                style={{ color: SEVERITY_COLORS[r.severity] }}
              >
                [{r.severity}]
              </span>
              <span className="flex-1">
                <span style={{ color: "var(--accent)" }}>[{r.category}]</span>{" "}
                {r.name}: {r.description}
              </span>
              {r.endpoint && (
                <span style={{ color: "var(--text-secondary)" }}>{r.endpoint}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
