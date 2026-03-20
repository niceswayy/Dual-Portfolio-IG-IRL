"use client";

import { Loader, CheckCircle } from "lucide-react";

interface AuditProgressProps {
  scanners: string[];
  completedScanners: string[];
  currentScanner: string | null;
  resultCount: number;
}

export default function AuditProgress({
  scanners,
  completedScanners,
  currentScanner,
  resultCount,
}: AuditProgressProps) {
  const progress = scanners.length > 0
    ? Math.round((completedScanners.length / scanners.length) * 100)
    : 0;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Audit Progress</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
            {resultCount} findings
          </span>
          <span className="text-xs font-mono font-bold" style={{ color: "var(--accent)" }}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full mb-4" style={{ background: "var(--bg-primary)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: "var(--accent)",
            boxShadow: "0 0 10px var(--accent-glow)",
          }}
        />
      </div>

      {/* Scanner list */}
      <div className="space-y-1.5">
        {scanners.map((name) => {
          const completed = completedScanners.includes(name);
          const running = currentScanner === name;

          return (
            <div
              key={name}
              className="flex items-center gap-2 p-2 rounded-lg text-sm"
              style={{
                background: running ? "var(--bg-tertiary)" : "transparent",
              }}
            >
              {completed ? (
                <CheckCircle size={14} style={{ color: "var(--success)" }} />
              ) : running ? (
                <Loader size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full" style={{ border: "2px solid var(--border)" }} />
              )}
              <span style={{ color: completed ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {name}
              </span>
              {running && (
                <span className="text-xs animate-pulse ml-auto" style={{ color: "var(--accent)" }}>
                  scanning...
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
