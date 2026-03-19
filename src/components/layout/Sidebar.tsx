"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  LayoutDashboard,
  Bot,
  Plug,
  Zap,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useStore } from "@/store";

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/agents", icon: Bot, label: "Agents" },
  { href: "/mcp", icon: Plug, label: "MCP Servers" },
  { href: "/skills", icon: Zap, label: "Skill Builder" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, agents } = useStore();

  const runningAgents = agents.filter((a) => a.status === "running").length;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
      style={{
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center glow-accent"
          style={{ background: "var(--accent)" }}
        >
          <Brain size={22} className="text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <h1 className="font-bold text-lg tracking-tight">Braincells</h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Agent Orchestrator
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active
                  ? "text-white"
                  : "hover:bg-[var(--bg-tertiary)]"
              }`}
              style={{
                background: active ? "var(--accent)" : undefined,
                color: active ? "white" : "var(--text-secondary)",
                boxShadow: active ? "0 0 20px var(--accent-glow)" : undefined,
              }}
            >
              <Icon size={20} />
              {sidebarOpen && <span className="font-medium text-sm">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Status bar */}
      {sidebarOpen && (
        <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="glass rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span style={{ color: "var(--text-secondary)" }}>Active Agents</span>
              <span className="font-mono font-bold" style={{ color: "var(--success)" }}>
                {runningAgents}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "var(--text-secondary)" }}>Total Agents</span>
              <span className="font-mono font-bold">{agents.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-1/2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border)",
        }}
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </aside>
  );
}
