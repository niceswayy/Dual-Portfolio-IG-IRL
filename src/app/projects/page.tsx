"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import Shell from "@/components/layout/Shell";
import Header from "@/components/layout/Header";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectForm from "@/components/projects/ProjectForm";
import { useStore } from "@/store";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const { projects } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      <Header title="Projects" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-secondary)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 w-72"
            />
          </div>
          <button onClick={() => { setEditProject(null); setFormOpen(true); }} className="btn btn-primary">
            <Plus size={16} /> New Project
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--text-secondary)" }}>
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">Create a project to organize agents, skills, and track interactions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => { setEditProject(p); setFormOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditProject(null); }}
        editProject={editProject}
      />
    </Shell>
  );
}
