"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import Shell from "@/components/layout/Shell";
import Header from "@/components/layout/Header";
import SkillCard from "@/components/skills/SkillCard";
import SkillForm from "@/components/skills/SkillForm";
import { useStore } from "@/store";
import type { Skill } from "@/types";

export default function SkillsPage() {
  const { skills, updateSkill } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<Skill | null>(null);
  const [search, setSearch] = useState("");

  const filtered = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRun = (skill: Skill) => {
    updateSkill(skill.id, { runs: skill.runs + 1 });
    // In a full implementation, this would trigger the skill execution pipeline
  };

  return (
    <Shell>
      <Header title="Skill Builder" />
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
              placeholder="Search skills..."
              className="pl-10 w-72"
            />
          </div>
          <button onClick={() => { setEditSkill(null); setFormOpen(true); }} className="btn btn-primary">
            <Plus size={16} /> New Skill
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--text-secondary)" }}>
            <p className="text-lg mb-2">No skills yet</p>
            <p className="text-sm">Create reusable prompt templates and tool configurations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onEdit={(s) => { setEditSkill(s); setFormOpen(true); }}
                onRun={handleRun}
              />
            ))}
          </div>
        )}
      </div>

      <SkillForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditSkill(null); }}
        editSkill={editSkill}
      />
    </Shell>
  );
}
