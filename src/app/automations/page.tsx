"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { v4 as uuid } from "uuid";
import Shell from "@/components/layout/Shell";
import Header from "@/components/layout/Header";
import AutomationCard from "@/components/automations/AutomationCard";
import AutomationForm from "@/components/automations/AutomationForm";
import WorkflowVisualizer from "@/components/automations/WorkflowVisualizer";
import RunHistory from "@/components/automations/RunHistory";
import { useStore } from "@/store";
import type { Automation, AutomationRun, AutomationStepResult } from "@/types";

export default function AutomationsPage() {
  const { automations, automationRuns, addAutomationRun, updateAutomationRun, updateAutomation, agents, addToast } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editAutomation, setEditAutomation] = useState<Automation | null>(null);
  const [search, setSearch] = useState("");
  const [activeRun, setActiveRun] = useState<AutomationRun | null>(null);

  const filtered = automations.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const runAutomation = async (automation: Automation) => {
    const runId = uuid();
    const stepResults: AutomationStepResult[] = automation.steps.map((s) => ({
      stepId: s.id,
      agentId: s.agentId,
      agentName: agents.find((a) => a.id === s.agentId)?.name || "Unknown",
      input: "",
      output: "",
      tokens: 0,
      duration: 0,
      status: "pending" as const,
    }));

    const run: AutomationRun = {
      id: runId,
      automationId: automation.id,
      automationName: automation.name,
      status: "running",
      startedAt: new Date().toISOString(),
      steps: stepResults,
    };

    addAutomationRun(run);
    setActiveRun(run);

    const steps = automation.steps.map((s) => {
      const agent = agents.find((a) => a.id === s.agentId);
      return {
        id: s.id,
        agentId: s.agentId,
        agentName: agent?.name || "Unknown",
        systemPrompt: agent?.systemPrompt || "",
        model: agent?.model || "gpt-4o",
        input: s.input,
        order: s.order,
      };
    });

    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ automationId: automation.id, triggerData: "", steps }),
      });

      if (!res.ok) throw new Error("Automation API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";
      const currentResults = [...stepResults];

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

            if (event.type === "step_start") {
              const idx = currentResults.findIndex((r) => r.stepId === event.stepId);
              if (idx !== -1) {
                currentResults[idx] = { ...currentResults[idx], status: "running", input: event.input };
                updateAutomationRun(runId, { steps: [...currentResults] });
              }
            } else if (event.type === "step_token") {
              const idx = currentResults.findIndex((r) => r.stepId === event.stepId);
              if (idx !== -1) {
                currentResults[idx] = { ...currentResults[idx], output: currentResults[idx].output + event.content };
                updateAutomationRun(runId, { steps: [...currentResults] });
              }
            } else if (event.type === "step_complete") {
              const idx = currentResults.findIndex((r) => r.stepId === event.stepId);
              if (idx !== -1) {
                currentResults[idx] = {
                  ...currentResults[idx],
                  status: "completed",
                  output: event.output,
                  tokens: event.tokens,
                  duration: event.duration,
                };
                updateAutomationRun(runId, { steps: [...currentResults] });
              }
            } else if (event.type === "step_error") {
              const idx = currentResults.findIndex((r) => r.stepId === event.stepId);
              if (idx !== -1) {
                currentResults[idx] = {
                  ...currentResults[idx],
                  status: "failed",
                  error: event.error,
                  duration: event.duration,
                };
                updateAutomationRun(runId, { steps: [...currentResults] });
              }
            } else if (event.type === "done") {
              const failed = currentResults.some((r) => r.status === "failed");
              updateAutomationRun(runId, {
                status: failed ? "failed" : "completed",
                completedAt: new Date().toISOString(),
                steps: [...currentResults],
              });
              updateAutomation(automation.id, {
                runCount: automation.runCount + 1,
                lastRun: new Date().toISOString(),
              });
              addToast({
                id: uuid(),
                type: failed ? "error" : "success",
                title: failed ? "Automation failed" : "Automation completed",
                message: automation.name,
              });
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (err) {
      updateAutomationRun(runId, {
        status: "failed",
        completedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Unknown error",
      });
      addToast({ id: uuid(), type: "error", title: "Automation failed", message: automation.name });
    }
  };

  return (
    <Shell>
      <Header title="Automations" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search automations..." className="pl-10 w-72" />
          </div>
          <button onClick={() => { setEditAutomation(null); setFormOpen(true); }} className="btn btn-primary">
            <Plus size={16} /> New Automation
          </button>
        </div>

        {/* Active run workflow */}
        {activeRun && (
          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-3">
              Running: {activeRun.automationName}
              {activeRun.status === "running" && (
                <span className="ml-2 text-xs animate-pulse" style={{ color: "var(--success)" }}>LIVE</span>
              )}
            </h3>
            <WorkflowVisualizer
              steps={automations.find((a) => a.id === activeRun.automationId)?.steps || []}
              results={activeRun.steps}
              running={activeRun.status === "running"}
            />
          </div>
        )}

        {/* Automation cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--text-secondary)" }}>
            <p className="text-lg mb-2">No automations</p>
            <p className="text-sm">Chain agents into automated workflows.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((automation) => (
              <AutomationCard
                key={automation.id}
                automation={automation}
                onEdit={(a) => { setEditAutomation(a); setFormOpen(true); }}
                onRun={runAutomation}
              />
            ))}
          </div>
        )}

        {/* Run History */}
        {automationRuns.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Run History</h3>
            <RunHistory runs={automationRuns} />
          </div>
        )}
      </div>

      <AutomationForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditAutomation(null); }}
        editAutomation={editAutomation}
      />
    </Shell>
  );
}
