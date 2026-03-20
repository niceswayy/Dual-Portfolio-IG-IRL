"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Plus } from "lucide-react";
import type { Automation, AutomationStep, TriggerType } from "@/types";
import { useStore } from "@/store";
import Modal from "@/components/shared/Modal";
import StepEditor from "./StepEditor";

const TRIGGERS: { value: TriggerType; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "schedule", label: "Scheduled (Cron)" },
  { value: "on_agent_complete", label: "On Agent Complete" },
  { value: "on_agent_error", label: "On Agent Error" },
  { value: "webhook", label: "Webhook" },
];

interface AutomationFormProps {
  open: boolean;
  onClose: () => void;
  editAutomation?: Automation | null;
}

export default function AutomationForm({ open, onClose, editAutomation }: AutomationFormProps) {
  const { addAutomation, updateAutomation, agents } = useStore();

  const [name, setName] = useState(editAutomation?.name || "");
  const [description, setDescription] = useState(editAutomation?.description || "");
  const [trigger, setTrigger] = useState<TriggerType>(editAutomation?.trigger || "manual");
  const [cronExpression, setCronExpression] = useState(editAutomation?.cronExpression || "");
  const [triggerAgentId, setTriggerAgentId] = useState(editAutomation?.triggerAgentId || "");
  const [steps, setSteps] = useState<AutomationStep[]>(
    editAutomation?.steps || []
  );

  const addStep = () => {
    setSteps([
      ...steps,
      { id: uuid(), agentId: "", input: "{{prev_output}}", order: steps.length },
    ]);
  };

  const updateStep = (index: number, step: AutomationStep) => {
    const updated = [...steps];
    updated[index] = step;
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  };

  const handleSubmit = () => {
    if (!name.trim() || steps.length === 0) return;

    if (editAutomation) {
      updateAutomation(editAutomation.id, {
        name, description, trigger, cronExpression, triggerAgentId, steps,
      });
    } else {
      addAutomation({
        id: uuid(),
        name, description, trigger, cronExpression, triggerAgentId, steps,
        enabled: true,
        runCount: 0,
        createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editAutomation ? "Edit Automation" : "New Automation"} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Automation name..." className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Trigger</label>
            <select value={trigger} onChange={(e) => setTrigger(e.target.value as TriggerType)} className="w-full">
              {TRIGGERS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this automation do..." className="w-full" />
        </div>

        {trigger === "schedule" && (
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Cron Expression</label>
            <input
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="*/30 * * * * (every 30 min)"
              className="w-full font-mono"
            />
          </div>
        )}

        {(trigger === "on_agent_complete" || trigger === "on_agent_error") && (
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Trigger Agent</label>
            <select value={triggerAgentId} onChange={(e) => setTriggerAgentId(e.target.value)} className="w-full">
              <option value="">Select agent...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Pipeline Steps ({steps.length})
            </label>
            <button onClick={addStep} className="btn btn-ghost text-xs">
              <Plus size={12} /> Add Step
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <StepEditor
                key={step.id}
                step={step}
                index={i}
                onChange={(s) => updateStep(i, s)}
                onRemove={() => removeStep(i)}
              />
            ))}
          </div>

          {steps.length === 0 && (
            <div className="text-center py-8 rounded-lg" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
              <p className="text-sm">Add steps to build your automation pipeline.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary">
            {editAutomation ? "Save" : "Create Automation"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
