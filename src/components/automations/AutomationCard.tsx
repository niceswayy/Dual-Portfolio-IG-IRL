"use client";

import { Workflow, Play, Trash2, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import type { Automation } from "@/types";
import { useStore } from "@/store";

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual",
  schedule: "Scheduled",
  on_agent_complete: "On Complete",
  on_agent_error: "On Error",
  webhook: "Webhook",
};

interface AutomationCardProps {
  automation: Automation;
  onEdit: (a: Automation) => void;
  onRun: (a: Automation) => void;
}

export default function AutomationCard({ automation, onEdit, onRun }: AutomationCardProps) {
  const { updateAutomation, removeAutomation } = useStore();

  return (
    <div className="glass rounded-xl p-5 card-hover cursor-pointer" onClick={() => onEdit(automation)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--accent)" }}
          >
            <Workflow size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{automation.name}</h3>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {TRIGGER_LABELS[automation.trigger]} &middot; {automation.steps.length} steps
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateAutomation(automation.id, { enabled: !automation.enabled });
          }}
          style={{ color: automation.enabled ? "var(--success)" : "var(--text-secondary)" }}
          className="cursor-pointer"
        >
          {automation.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
        </button>
      </div>

      {automation.description && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
          {automation.description}
        </p>
      )}

      {automation.cronExpression && (
        <div className="flex items-center gap-1.5 mb-3">
          <Clock size={12} style={{ color: "var(--text-secondary)" }} />
          <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
            {automation.cronExpression}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
        <span>{automation.runCount} runs</span>
        {automation.lastRun && (
          <span>Last: {new Date(automation.lastRun).toLocaleDateString()}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={(e) => { e.stopPropagation(); onRun(automation); }}
          className="btn btn-primary text-xs flex-1"
        >
          <Play size={12} /> Run Now
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); removeAutomation(automation.id); }}
          className="btn btn-danger text-xs px-2"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
