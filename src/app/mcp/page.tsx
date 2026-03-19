"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import Shell from "@/components/layout/Shell";
import Header from "@/components/layout/Header";
import MCPServerCard from "@/components/mcp/MCPServerCard";
import MCPServerForm from "@/components/mcp/MCPServerForm";
import { useStore } from "@/store";
import type { MCPServer } from "@/types";

export default function MCPPage() {
  const { mcpServers } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editServer, setEditServer] = useState<MCPServer | null>(null);
  const [search, setSearch] = useState("");

  const filtered = mcpServers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      <Header title="MCP Servers" />
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
              placeholder="Search MCP servers..."
              className="pl-10 w-72"
            />
          </div>
          <button onClick={() => { setEditServer(null); setFormOpen(true); }} className="btn btn-primary">
            <Plus size={16} /> Add Server
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--text-secondary)" }}>
            <p className="text-lg mb-2">No MCP servers</p>
            <p className="text-sm">Add an MCP server to extend your agents with external tools.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((server) => (
              <MCPServerCard
                key={server.id}
                server={server}
                onEdit={(s) => { setEditServer(s); setFormOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      <MCPServerForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditServer(null); }}
        editServer={editServer}
      />
    </Shell>
  );
}
