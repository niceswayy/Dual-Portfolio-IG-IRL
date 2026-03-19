"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { Skill } from "@/types";
import { useStore } from "@/store";
import Modal from "@/components/shared/Modal";

interface SkillFormProps {
  open: boolean;
  onClose: () => void;
  editSkill?: Skill | null;
}

export default function SkillForm({ open, onClose, editSkill }: SkillFormProps) {
  const { addSkill, updateSkill } = useStore();

  const [name, setName] = useState(editSkill?.name || "");
  const [description, setDescription] = useState(editSkill?.description || "");
  const [prompt, setPrompt] = useState(editSkill?.prompt || "");
  const [tagsInput, setTagsInput] = useState(editSkill?.tags?.join(", ") || "");
  const [toolsInput, setToolsInput] = useState(editSkill?.tools?.join(", ") || "");

  const handleSubmit = () => {
    if (!name.trim() || !prompt.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const tools = toolsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editSkill) {
      updateSkill(editSkill.id, { name, description, prompt, tags, tools });
    } else {
      addSkill({
        id: uuid(),
        name,
        description,
        prompt,
        tags,
        tools,
        runs: 0,
        createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editSkill ? "Edit Skill" : "New Skill"} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Name
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Skill name..." className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Tags (comma separated)
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="research, code, analysis"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Description
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this skill do..."
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Prompt Template
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            placeholder="Write the prompt template. Use {{input}} for dynamic input..."
            className="w-full resize-none font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Tools (comma separated)
          </label>
          <input
            value={toolsInput}
            onChange={(e) => setToolsInput(e.target.value)}
            placeholder="web_search, code_interpreter"
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary">
            {editSkill ? "Save" : "Create Skill"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
