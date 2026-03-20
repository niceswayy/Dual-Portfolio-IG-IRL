"use client";

import { useRef, useEffect } from "react";
import type { AutomationStepResult } from "@/types";
import { useStore } from "@/store";

interface WorkflowVisualizerProps {
  steps: { id: string; agentId: string; order: number }[];
  results?: AutomationStepResult[];
  running?: boolean;
}

export default function WorkflowVisualizer({ steps, results, running }: WorkflowVisualizerProps) {
  const { agents } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || steps.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = 2;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const nodeW = 120;
    const nodeH = 50;
    const gap = 40;
    const totalW = steps.length * nodeW + (steps.length - 1) * gap;
    const startX = (w - totalW) / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Draw connections
    for (let i = 0; i < steps.length - 1; i++) {
      const fromX = startX + i * (nodeW + gap) + nodeW;
      const toX = startX + (i + 1) * (nodeW + gap);

      ctx.beginPath();
      ctx.moveTo(fromX, cy);
      ctx.lineTo(toX, cy);
      ctx.strokeStyle = "#2a2a4a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arrow
      ctx.beginPath();
      ctx.moveTo(toX - 8, cy - 5);
      ctx.lineTo(toX, cy);
      ctx.lineTo(toX - 8, cy + 5);
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw nodes
    steps.forEach((step, i) => {
      const x = startX + i * (nodeW + gap);
      const y = cy - nodeH / 2;
      const agent = agents.find((a) => a.id === step.agentId);
      const result = results?.find((r) => r.stepId === step.id);
      const status = result?.status || "pending";

      const statusColors: Record<string, { bg: string; border: string }> = {
        pending: { bg: "#1a1a2e", border: "#2a2a4a" },
        running: { bg: "rgba(34, 197, 94, 0.1)", border: "#22c55e" },
        completed: { bg: "rgba(99, 102, 241, 0.1)", border: "#6366f1" },
        failed: { bg: "rgba(239, 68, 68, 0.1)", border: "#ef4444" },
      };

      const colors = statusColors[status] || statusColors.pending;

      // Node background
      ctx.beginPath();
      ctx.roundRect(x, y, nodeW, nodeH, 10);
      ctx.fillStyle = colors.bg;
      ctx.fill();
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glow for running
      if (status === "running") {
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 15;
        ctx.strokeStyle = "#22c55e";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Step number
      ctx.fillStyle = "#9191b0";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Step ${i + 1}`, x + nodeW / 2, y + 16);

      // Agent name
      ctx.fillStyle = "#e4e4f0";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillText(
        agent?.name || "Unassigned",
        x + nodeW / 2,
        y + 34
      );
    });
  }, [steps, results, agents, running]);

  if (steps.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
        <p className="text-sm">Add steps to visualize the workflow</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg"
      style={{ height: "120px", background: "var(--bg-primary)" }}
    />
  );
}
