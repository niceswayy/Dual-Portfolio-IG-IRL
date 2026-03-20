"use client";

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: number;
}

export default function ScoreGauge({ score, label, size = 120 }: ScoreGaugeProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 90) return "#22c55e";
    if (s >= 70) return "#f59e0b";
    if (s >= 50) return "#f97316";
    return "#ef4444";
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          {/* Score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-gauge"
            style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono" style={{ color }}>
            {score}
          </span>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            / 100
          </span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
    </div>
  );
}
