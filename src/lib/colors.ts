export const AGENT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
];

export function getRandomColor(): string {
  return AGENT_COLORS[Math.floor(Math.random() * AGENT_COLORS.length)];
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "running":
      return "#22c55e";
    case "error":
      return "#ef4444";
    case "completed":
      return "#3b82f6";
    case "idle":
    default:
      return "#6b7280";
  }
}
