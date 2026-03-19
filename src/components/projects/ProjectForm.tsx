"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { Project } from "@/types";
import { useStore } from "@/store";
import Modal from "@/components/shared/Modal";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  editProject?: Project | null;
}

export default function ProjectForm({ open, onClose, editProject }: ProjectFormProps) {
  const { addProject, updateProject, agents, skills } = useStore();

  const [name, setName] = useState(editProject?.name || "");
  const [description, setDescription] = useState(editProject?.description || "");
  const [status, setStatus] = useState<Project["status"]>(editProject?.status || "active");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(editProject?.agents || []);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(editProject?.skills || []);
  const [notionPageId, setNotionPageId] = useState(editProject?.notionPageId || "");

  const toggle = (list: string[], setList: (l: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (editProject) {
      updateProject(editProject.id, {
        name,
        description,
        status,
        agents: selectedAgents,
        skills: selectedSkills,
        notionPageId: notionPageId || undefined,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addProject({
        id: uuid(),
        name,
        description,
        status,
        agents: selectedAgents,
        skills: selectedSkills,
        notionPageId: notionPageId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editProject ? "Edit Project" : "New Project"} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name..." className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Project["status"])} className="w-full">
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Project description..."
            className="w-full resize-none"
          />
        </div>

        {/* Agents */}
        {agents.length > 0 && (
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Assign Agents</label>
            <div className="flex flex-wrap gap-2">
              {agents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggle(selectedAgents, setSelectedAgents, a.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-all"
                  style={{
                    borderColor: selectedAgents.includes(a.id) ? a.color : "var(--border)",
                    background: selectedAgents.includes(a.id) ? `${a.color}15` : "transparent",
                    color: selectedAgents.includes(a.id) ? a.color : "var(--text-secondary)",
                  }}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Assign Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggle(selectedSkills, setSelectedSkills, s.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-all"
                  style={{
                    borderColor: selectedSkills.includes(s.id) ? "var(--accent)" : "var(--border)",
                    background: selectedSkills.includes(s.id) ? "rgba(99, 102, 241, 0.1)" : "transparent",
                    color: selectedSkills.includes(s.id) ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notion */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Notion Page ID (optional)</label>
          <input
            value={notionPageId}
            onChange={(e) => setNotionPageId(e.target.value)}
            placeholder="abc123..."
            className="w-full font-mono"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary">
            {editProject ? "Save" : "Create Project"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
