"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import Shell from "@/components/layout/Shell";
import Header from "@/components/layout/Header";
import AgentCard from "@/components/agents/AgentCard";
import AgentForm from "@/components/agents/AgentForm";
import ChatPanel from "@/components/agents/ChatPanel";
import { useStore } from "@/store";
import type { Agent } from "@/types";

export default function AgentsPage() {
  const { agents } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [chatAgentId, setChatAgentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      <Header title="Agents" />
      <div className="p-6">
        {/* Toolbar */}
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
              placeholder="Search agents..."
              className="pl-10 w-72"
            />
          </div>
          <button onClick={() => { setEditAgent(null); setFormOpen(true); }} className="btn btn-primary">
            <Plus size={16} /> New Agent
          </button>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--text-secondary)" }}>
            <p className="text-lg mb-2">No agents yet</p>
            <p className="text-sm">Create your first agent to start orchestrating.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onChat={(id) => setChatAgentId(id)}
                onEdit={(a) => { setEditAgent(a); setFormOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      <AgentForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditAgent(null); }}
        editAgent={editAgent}
      />

      {chatAgentId && (
        <ChatPanel agentId={chatAgentId} onClose={() => setChatAgentId(null)} />
      )}
    </Shell>
  );
}
