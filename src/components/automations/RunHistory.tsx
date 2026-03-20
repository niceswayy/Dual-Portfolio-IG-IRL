"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, CheckCircle, XCircle, Loader } from "lucide-react";
import type { AutomationRun, AutomationStepResult } from "@/types";

interface RunHistoryProps {
  runs: AutomationRun[];
}

export default function RunHistory({ runs }: RunHistoryProps) {
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  if (runs.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
        <p className="text-sm">No runs yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {runs.slice().reverse().map((run) => (
        <div key={run.id} className="glass rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
            className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <StatusIcon status={run.status} />
              <div>
                <span className="text-sm font-medium">{run.automationName}</span>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <Clock size={10} />
                  {new Date(run.startedAt).toLocaleString()}
                  {run.completedAt && (
                    <span>
                      &middot; {((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                {run.steps.length} steps
              </span>
              {expandedRun === run.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          </button>

          {expandedRun === run.id && (
            <div className="px-4 pb-4 space-y-2">
              {run.steps.map((step, i) => (
                <StepResultCard key={step.stepId} step={step} index={i} />
              ))}
              {run.error && (
                <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--error)" }}>
                  {run.error}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StepResultCard({ step, index }: { step: AutomationStepResult; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "var(--bg-primary)",
        borderLeft: `3px solid ${step.status === "completed" ? "var(--accent)" : step.status === "failed" ? "var(--error)" : "var(--border)"}`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <StatusIcon status={step.status} size={14} />
          <span className="text-xs font-medium">Step {index + 1}: {step.agentName}</span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span>{step.tokens} tok</span>
          <span>{(step.duration / 1000).toFixed(1)}s</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          <div>
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Input:</span>
            <div className="code-block text-xs mt-1 max-h-32 overflow-auto">{step.input}</div>
          </div>
          <div>
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Output:</span>
            <div className="code-block text-xs mt-1 max-h-32 overflow-auto">{step.output || step.error || "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status, size = 16 }: { status: string; size?: number }) {
  switch (status) {
    case "completed":
      return <CheckCircle size={size} style={{ color: "var(--success)" }} />;
    case "failed":
      return <XCircle size={size} style={{ color: "var(--error)" }} />;
    case "running":
      return <Loader size={size} className="animate-spin" style={{ color: "var(--accent)" }} />;
    default:
      return <div className="status-dot idle" />;
  }
}
