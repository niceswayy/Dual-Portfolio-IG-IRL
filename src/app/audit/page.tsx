"use client";

import { useState } from "react";
import { Shield, Eye, Play, Loader } from "lucide-react";
import { v4 as uuid } from "uuid";
import Shell from "@/components/layout/Shell";
import Header from "@/components/layout/Header";
import ScoreGauge from "@/components/audit/ScoreGauge";
import SeverityChart from "@/components/audit/SeverityChart";
import AuditResultCard from "@/components/audit/AuditResultCard";
import AuditProgress from "@/components/audit/AuditProgress";
import AuditLogs from "@/components/audit/AuditLogs";
import VisualAuditDashboard from "@/components/audit/VisualAuditDashboard";
import { useStore } from "@/store";
import type { AuditResult, AuditRun, AuditSummary } from "@/types";

type Tab = "security" | "visual";

export default function AuditPage() {
  const { auditRuns, addAuditRun, updateAuditRun, addToast } = useStore();
  const [tab, setTab] = useState<Tab>("security");
  const [running, setRunning] = useState(false);
  const [scanners, setScanners] = useState<string[]>([]);
  const [completedScanners, setCompletedScanners] = useState<string[]>([]);
  const [currentScanner, setCurrentScanner] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<AuditResult[]>([]);

  const latestRun = auditRuns.length > 0 ? auditRuns[auditRuns.length - 1] : null;

  const runSecurityAudit = async () => {
    setRunning(true);
    setLiveResults([]);
    setCompletedScanners([]);
    setCurrentScanner(null);

    const runId = uuid();
    const run: AuditRun = {
      id: runId,
      type: "security",
      status: "running",
      startedAt: new Date().toISOString(),
      results: [],
      score: 0,
      summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0, pass: 0 },
    };
    addAuditRun(run);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "security" }),
      });

      if (!res.ok) throw new Error("Audit API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";
      const allResults: AuditResult[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "start") {
              setScanners(event.scanners);
              if (event.scanners.length > 0) {
                setCurrentScanner(event.scanners[0]);
              }
            } else if (event.type === "scanner_complete") {
              allResults.push(...event.results);
              setLiveResults([...allResults]);
              setCompletedScanners((prev) => [...prev, event.scanner]);
              // Set next scanner as current
              setScanners((prev) => {
                const idx = prev.indexOf(event.scanner);
                if (idx < prev.length - 1) {
                  setCurrentScanner(prev[idx + 1]);
                } else {
                  setCurrentScanner(null);
                }
                return prev;
              });
            } else if (event.type === "done") {
              updateAuditRun(runId, {
                status: "completed",
                completedAt: new Date().toISOString(),
                results: event.results,
                score: event.score,
                summary: event.summary,
              });
              setLiveResults(event.results);
              addToast({
                id: uuid(),
                type: event.score >= 70 ? "success" : "warning",
                title: `Security audit: ${event.score}/100`,
                message: `${event.total} checks completed`,
              });
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      updateAuditRun(runId, {
        status: "failed",
        completedAt: new Date().toISOString(),
      });
      addToast({
        id: uuid(),
        type: "error",
        title: "Audit failed",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setRunning(false);
      setCurrentScanner(null);
    }
  };

  const displayResults = liveResults.length > 0 ? liveResults : latestRun?.results || [];
  const displayScore = liveResults.length > 0
    ? (latestRun?.score ?? 0)
    : (latestRun?.score ?? 0);
  const displaySummary: AuditSummary = latestRun?.summary || { critical: 0, high: 0, medium: 0, low: 0, info: 0, pass: 0 };

  return (
    <Shell>
      <Header title="Audit Center" />
      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--bg-secondary)" }}>
          <button
            onClick={() => setTab("security")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={{
              background: tab === "security" ? "var(--accent)" : "transparent",
              color: tab === "security" ? "white" : "var(--text-secondary)",
            }}
          >
            <Shield size={14} /> Security
          </button>
          <button
            onClick={() => setTab("visual")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={{
              background: tab === "visual" ? "var(--accent)" : "transparent",
              color: tab === "visual" ? "white" : "var(--text-secondary)",
            }}
          >
            <Eye size={14} /> Visual
          </button>
        </div>

        {tab === "security" && (
          <>
            {/* Launch bar */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Security Penetration Audit</h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  OWASP Top 10 checks, XSS, SSRF, injection, headers, rate limiting, config analysis
                </p>
              </div>
              <button
                onClick={runSecurityAudit}
                disabled={running}
                className="btn btn-primary"
                style={{ opacity: running ? 0.7 : 1 }}
              >
                {running ? <Loader size={14} className="animate-spin" /> : <Play size={14} />}
                {running ? "Running Audit..." : "Run Security Audit"}
              </button>
            </div>

            {/* Progress (during scan) */}
            {running && (
              <AuditProgress
                scanners={scanners}
                completedScanners={completedScanners}
                currentScanner={currentScanner}
                resultCount={liveResults.length}
              />
            )}

            {/* Results */}
            {displayResults.length > 0 && (
              <>
                {/* Score + Summary */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="glass rounded-xl p-6 flex items-center justify-center">
                    <ScoreGauge score={displayScore} label="Security Score" size={160} />
                  </div>
                  <div className="glass rounded-xl p-6 col-span-2">
                    <h4 className="font-semibold text-sm mb-4">Severity Distribution</h4>
                    <SeverityChart summary={displaySummary} />
                  </div>
                </div>

                {/* Result cards */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Findings ({displayResults.length})
                  </h4>
                  <div className="space-y-2">
                    {displayResults
                      .sort((a, b) => {
                        const order = ["critical", "high", "medium", "low", "info", "pass"];
                        return order.indexOf(a.severity) - order.indexOf(b.severity);
                      })
                      .map((r) => (
                        <AuditResultCard key={r.id} result={r} />
                      ))}
                  </div>
                </div>

                {/* Logs */}
                <AuditLogs results={displayResults} />
              </>
            )}

            {!running && displayResults.length === 0 && (
              <div className="text-center py-20" style={{ color: "var(--text-secondary)" }}>
                <Shield size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg mb-2">No audit results</p>
                <p className="text-sm">Run a security audit to scan for vulnerabilities.</p>
              </div>
            )}
          </>
        )}

        {tab === "visual" && <VisualAuditDashboard />}
      </div>
    </Shell>
  );
}
