"use client";

import { GripVertical, Trash2, Bot, Zap } from "lucide-react";
import type { AutomationStep } from "@/types";
import { useStore } from "@/store";

interface StepEditorProps {
  step: AutomationStep;
  index: number;
  onChange: (step: AutomationStep) => void;
  onRemove: () => void;
}

export default function StepEditor({ step, index, onChange, onRemove }: StepEditorProps) {
  const { agents, skills } = useStore();

  return (
    <div
      className="glass rounded-lg p-4 flex items-start gap-3"
      style={{ borderLeft: "3px solid var(--accent)" }}
    >
      <div className="flex items-center gap-2 pt-1" style={{ color: "var(--text-secondary)" }}>
        <GripVertical size={14} className="cursor-grab" />
        <span className="text-xs font-mono font-bold w-5">{index + 1}</span>
      </div>

      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              <Bot size={10} className="inline mr-1" /> Agent
            </label>
            <select
              value={step.agentId}
              onChange={(e) => onChange({ ...step, agentId: e.target.value })}
              className="w-full text-sm"
            >
              <option value="">Select agent...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              <Zap size={10} className="inline mr-1" /> Skill (optional)
            </label>
            <select
              value={step.skillId || ""}
              onChange={(e) => onChange({ ...step, skillId: e.target.value || undefined })}
              className="w-full text-sm"
            >
              <option value="">No skill</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Input Template
          </label>
          <textarea
            value={step.input}
            onChange={(e) => onChange({ ...step, input: e.target.value })}
            rows={2}
            placeholder="Use {{prev_output}} for previous step output, {{trigger_data}} for trigger data"
            className="w-full text-sm resize-none font-mono"
          />
        </div>
      </div>

      <button onClick={onRemove} className="btn btn-danger px-2 py-1.5 mt-1">
        <Trash2 size={12} />
      </button>
    </div>
  );
}
