"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Shield, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import type { AuditResult } from "@/types";

const SEVERITY_STYLES: Record<string, { color: string; bg: string; icon: typeof Shield }> = {
  critical: { color: "#991b1b", bg: "rgba(153, 27, 27, 0.1)", icon: AlertCircle },
  high: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", icon: AlertTriangle },
  medium: { color: "#f97316", bg: "rgba(249, 115, 22, 0.1)", icon: AlertTriangle },
  low: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: Info },
  info: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", icon: Info },
  pass: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", icon: CheckCircle },
};

export default function AuditResultCard({ result }: { result: AuditResult }) {
  const [expanded, setExpanded] = useState(false);
  const style = SEVERITY_STYLES[result.severity] || SEVERITY_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{ background: style.bg, borderLeft: `3px solid ${style.color}` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <Icon size={16} style={{ color: style.color }} />
          <div>
            <span className="text-sm font-medium">{result.name}</span>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {result.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-full uppercase font-bold"
            style={{ color: style.color, background: `${style.color}20` }}
          >
            {result.severity}
          </span>
          {result.endpoint && (
            <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
              {result.endpoint}
            </span>
          )}
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="code-block text-xs">
            <span style={{ color: "var(--text-secondary)" }}>Details: </span>
            {result.details}
          </div>
          <div className="text-xs p-2 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
            <span className="font-medium" style={{ color: "var(--accent)" }}>Recommendation: </span>
            {result.recommendation}
          </div>
          {result.autoFixAvailable && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--accent)" }}>
                Auto-fix available
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
