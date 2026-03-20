export default function RootLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: "3px solid var(--border)",
              borderTopColor: "var(--accent)",
              animationDuration: "1s",
            }}
          />
          {/* Inner dot */}
          <div
            className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse-glow"
            style={{ background: "var(--accent)" }}
          />
        </div>
        <p className="text-sm font-medium animate-pulse" style={{ color: "var(--text-secondary)" }}>
          Syncing neural pathways...
        </p>
      </div>
    </div>
  );
}
