"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { Agent, AgentRole } from "@/types";
import { useStore } from "@/store";
import { getRandomColor } from "@/lib/colors";
import Modal from "@/components/shared/Modal";

const ROLES: AgentRole[] = [
  "orchestrator",
  "worker",
  "reviewer",
  "researcher",
  "coder",
  "custom",
];

const MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1", "o1-mini"];

interface AgentFormProps {
  open: boolean;
  onClose: () => void;
  editAgent?: Agent | null;
}

export default function AgentForm({ open, onClose, editAgent }: AgentFormProps) {
  const { addAgent, updateAgent, mcpServers, skills } = useStore();

  const [name, setName] = useState(editAgent?.name || "");
  const [role, setRole] = useState<AgentRole>(editAgent?.role || "worker");
  const [model, setModel] = useState(editAgent?.model || "gpt-4o");
  const [systemPrompt, setSystemPrompt] = useState(
    editAgent?.systemPrompt || ""
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    editAgent?.skills || []
  );
  const [selectedMcp, setSelectedMcp] = useState<string[]>(
    editAgent?.mcpConnections || []
  );

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (editAgent) {
      updateAgent(editAgent.id, {
        name,
        role,
        model,
        systemPrompt,
        skills: selectedSkills,
        mcpConnections: selectedMcp,
      });
    } else {
      const agent: Agent = {
        id: uuid(),
        name,
        role,
        model,
        systemPrompt,
        skills: selectedSkills,
        mcpConnections: selectedMcp,
        status: "idle",
        tokensUsed: 0,
        createdAt: new Date().toISOString(),
        color: getRandomColor(),
      };
      addAgent(agent);
    }
    onClose();
  };

  const toggleItem = (
    list: string[],
    setList: (l: string[]) => void,
    item: string
  ) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editAgent ? "Edit Agent" : "New Agent"}
      wide
    >
      <div className="space-y-4">
        {/* Name & Role */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Agent name..."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Role
            </label>
            <select value={role} onChange={(e) => setRole(e.target.value as AgentRole)} className="w-full">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Model
          </label>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full">
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            System Prompt
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            placeholder="Define the agent's behavior and capabilities..."
            className="w-full resize-none"
          />
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleItem(selectedSkills, setSelectedSkills, s.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                    selectedSkills.includes(s.id)
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[var(--border)]"
                  }`}
                  style={{
                    background: selectedSkills.includes(s.id)
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                    color: selectedSkills.includes(s.id) ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MCP Servers */}
        {mcpServers.length > 0 && (
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              MCP Connections
            </label>
            <div className="flex flex-wrap gap-2">
              {mcpServers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleItem(selectedMcp, setSelectedMcp, m.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                    selectedMcp.includes(m.id)
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[var(--border)]"
                  }`}
                  style={{
                    background: selectedMcp.includes(m.id)
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                    color: selectedMcp.includes(m.id) ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  {m.name} {m.connected ? "●" : "○"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn btn-primary">
            {editAgent ? "Save Changes" : "Create Agent"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
