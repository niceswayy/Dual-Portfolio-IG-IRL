"use client";

import { Zap, Play, Trash2, Edit3 } from "lucide-react";
import type { Skill } from "@/types";
import { useStore } from "@/store";

interface SkillCardProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onRun: (skill: Skill) => void;
}

export default function SkillCard({ skill, onEdit, onRun }: SkillCardProps) {
  const { removeSkill } = useStore();

  return (
    <div className="glass rounded-xl p-5 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}
          >
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{skill.name}</h3>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {skill.runs} runs
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
        {skill.description}
      </p>

      {/* Tags */}
      {skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Prompt preview */}
      <div className="code-block text-xs mb-3 line-clamp-3" style={{ color: "var(--text-secondary)" }}>
        {skill.prompt.slice(0, 120)}{skill.prompt.length > 120 ? "..." : ""}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
        <button onClick={() => onRun(skill)} className="btn btn-primary text-xs flex-1">
          <Play size={12} /> Run
        </button>
        <button onClick={() => onEdit(skill)} className="btn btn-ghost text-xs px-2">
          <Edit3 size={12} />
        </button>
        <button
          onClick={() => removeSkill(skill.id)}
          className="btn btn-danger text-xs px-2"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
