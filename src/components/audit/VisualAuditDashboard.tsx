"use client";

import { useState } from "react";
import { Play, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import ScoreGauge from "./ScoreGauge";
import type { VisualAuditResult, VisualAuditDetail } from "@/types";
import { runFullVisualAudit } from "@/lib/audit/visual-engine";

export default function VisualAuditDashboard() {
  const [results, setResults] = useState<VisualAuditResult[]>([]);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    // Run in next tick to allow UI to update
    setTimeout(() => {
      const res = runFullVisualAudit();
      setResults(res);
      setRunning(false);
    }, 100);
  };

  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Visual Audit</h3>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Performance, Accessibility, SEO & Responsive checks
          </p>
        </div>
        <button onClick={run} disabled={running} className="btn btn-primary">
          <Play size={14} /> {running ? "Running..." : "Run Visual Audit"}
        </button>
      </div>

      {/* Score gauges */}
      {results.length > 0 && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-around">
            <ScoreGauge score={avgScore} label="Overall" size={140} />
            {results.map((r) => (
              <ScoreGauge key={r.id} score={r.score} label={r.category} />
            ))}
          </div>
        </div>
      )}

      {/* Detail cards */}
      {results.map((result) => (
        <div key={result.id} className="glass rounded-xl p-5">
          <h4 className="font-semibold text-sm mb-3 capitalize">{result.name}</h4>
          <div className="space-y-2">
            {result.details.map((detail, i) => (
              <DetailRow key={i} detail={detail} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailRow({ detail }: { detail: VisualAuditDetail }) {
  const icons = {
    pass: <CheckCircle size={14} style={{ color: "var(--success)" }} />,
    warn: <AlertTriangle size={14} style={{ color: "var(--warning)" }} />,
    fail: <XCircle size={14} style={{ color: "var(--error)" }} />,
  };

  return (
    <div
      className="flex items-start gap-3 p-2 rounded-lg"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="mt-0.5">{icons[detail.status]}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{detail.check}</span>
          <span
            className="text-xs uppercase font-mono"
            style={{
              color:
                detail.status === "pass" ? "var(--success)"
                : detail.status === "warn" ? "var(--warning)"
                : "var(--error)",
            }}
          >
            {detail.status}
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {detail.message}
        </p>
        {detail.suggestion && (
          <p className="text-xs mt-1" style={{ color: "var(--accent)" }}>
            {detail.suggestion}
          </p>
        )}
        {detail.element && (
          <code className="text-xs mt-1 block font-mono" style={{ color: "var(--text-secondary)" }}>
            {detail.element}
          </code>
        )}
      </div>
    </div>
  );
}
