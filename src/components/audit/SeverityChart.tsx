"use client";

import type { AuditSummary } from "@/types";

const SEVERITY_CONFIG = [
  { key: "critical" as const, label: "Critical", color: "#991b1b" },
  { key: "high" as const, label: "High", color: "#ef4444" },
  { key: "medium" as const, label: "Medium", color: "#f97316" },
  { key: "low" as const, label: "Low", color: "#f59e0b" },
  { key: "info" as const, label: "Info", color: "#3b82f6" },
  { key: "pass" as const, label: "Pass", color: "#22c55e" },
];

export default function SeverityChart({ summary }: { summary: AuditSummary }) {
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div className="space-y-2">
      {SEVERITY_CONFIG.map(({ key, label, color }) => {
        const count = summary[key];
        const pct = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={key} className="flex items-center gap-3">
            <span
              className="text-xs font-medium w-14 text-right"
              style={{ color: "var(--text-secondary)" }}
            >
              {label}
            </span>
            <div
              className="flex-1 h-5 rounded-full overflow-hidden"
              style={{ background: "var(--bg-primary)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: color,
                  boxShadow: count > 0 ? `0 0 8px ${color}40` : undefined,
                  minWidth: count > 0 ? "8px" : "0",
                }}
              />
            </div>
            <span className="text-xs font-mono w-8 text-right font-bold" style={{ color }}>
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
