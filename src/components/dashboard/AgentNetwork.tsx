"use client";

import { useStore } from "@/store";
import { useEffect, useRef } from "react";

export default function AgentNetwork() {
  const { agents, interactions } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear
    ctx.clearRect(0, 0, w, h);

    if (agents.length === 0) {
      ctx.fillStyle = "rgba(145, 145, 176, 0.4)";
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Add agents to visualize the network", cx, cy);
      return;
    }

    // Position agents in a circle
    const radius = Math.min(w, h) * 0.35;
    const positions = agents.map((_, i) => {
      const angle = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });

    // Draw connections
    const time = Date.now() / 1000;
    for (const interaction of interactions.slice(-20)) {
      const fromIdx = agents.findIndex((a) => a.id === interaction.fromAgentId);
      const toIdx = agents.findIndex((a) => a.id === interaction.toAgentId);
      if (fromIdx === -1 || toIdx === -1) continue;

      const from = positions[fromIdx];
      const to = positions[toIdx];
      const fromAgent = agents[fromIdx];

      ctx.beginPath();
      ctx.strokeStyle = fromAgent.color + "40";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -time * 20;
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw nodes
    agents.forEach((agent, i) => {
      const pos = positions[i];
      const nodeRadius = 22;

      // Glow for running
      if (agent.status === "running") {
        const glow = ctx.createRadialGradient(
          pos.x, pos.y, nodeRadius,
          pos.x, pos.y, nodeRadius + 15
        );
        glow.addColorStop(0, agent.color + "40");
        glow.addColorStop(1, agent.color + "00");
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius + 15, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = agent.color + "20";
      ctx.fill();
      ctx.strokeStyle = agent.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = "var(--text-primary)";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#e4e4f0";
      ctx.fillText(agent.name, pos.x, pos.y + nodeRadius + 16);

      // Status indicator
      const statusColors: Record<string, string> = {
        running: "#22c55e",
        error: "#ef4444",
        idle: "#6b7280",
        completed: "#3b82f6",
      };
      ctx.beginPath();
      ctx.arc(pos.x + nodeRadius - 4, pos.y - nodeRadius + 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = statusColors[agent.status] || "#6b7280";
      ctx.fill();

      // Icon text
      ctx.fillStyle = agent.color;
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(agent.name.charAt(0).toUpperCase(), pos.x, pos.y);
      ctx.textBaseline = "alphabetic";
    });
  }, [agents, interactions]);

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="font-semibold mb-4">Agent Network</h3>
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg"
        style={{ height: "300px", background: "var(--bg-primary)" }}
      />
    </div>
  );
}
