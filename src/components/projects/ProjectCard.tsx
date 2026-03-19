"use client";

import { FolderKanban, Users, Zap, Trash2, ExternalLink } from "lucide-react";
import type { Project } from "@/types";
import { useStore } from "@/store";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const { removeProject, agents, skills } = useStore();
  const projectAgents = agents.filter((a) => project.agents.includes(a.id));
  const projectSkills = skills.filter((s) => project.skills.includes(s.id));

  const statusColors: Record<string, string> = {
    active: "var(--success)",
    paused: "var(--warning)",
    completed: "#3b82f6",
    archived: "var(--text-secondary)",
  };

  return (
    <div className="glass rounded-xl p-5 card-hover cursor-pointer" onClick={() => onEdit(project)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(236, 72, 153, 0.15)", color: "#ec4899" }}
          >
            <FolderKanban size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{project.name}</h3>
            <span
              className="text-xs capitalize"
              style={{ color: statusColors[project.status] }}
            >
              {project.status}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
        {project.description}
      </p>

      {/* Agents */}
      <div className="flex items-center gap-2 mb-2">
        <Users size={12} style={{ color: "var(--text-secondary)" }} />
        <div className="flex -space-x-2">
          {projectAgents.slice(0, 4).map((a) => (
            <div
              key={a.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2"
              style={{
                background: a.color,
                borderColor: "var(--bg-card)",
                color: "white",
              }}
              title={a.name}
            >
              {a.name[0]}
            </div>
          ))}
        </div>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {projectAgents.length} agents
        </span>
      </div>

      {/* Skills */}
      <div className="flex items-center gap-2 mb-3">
        <Zap size={12} style={{ color: "var(--text-secondary)" }} />
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {projectSkills.length} skills
        </span>
      </div>

      {/* Notion link */}
      {project.notionPageId && (
        <div className="flex items-center gap-1.5 mb-3">
          <ExternalLink size={12} style={{ color: "var(--accent)" }} />
          <span className="text-xs" style={{ color: "var(--accent)" }}>
            Linked to Notion
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
        <button onClick={() => onEdit(project)} className="btn btn-ghost text-xs flex-1">
          Open Project
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeProject(project.id);
          }}
          className="btn btn-danger text-xs px-2"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
