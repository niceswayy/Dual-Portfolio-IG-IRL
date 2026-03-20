"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="glass rounded-2xl p-10 max-w-md text-center">
        <div
          className="w-16 h-16 rounded-xl mx-auto mb-6 flex items-center justify-center glow-error"
          style={{ background: "rgba(239, 68, 68, 0.15)", color: "var(--error)" }}
        >
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p
            className="text-xs font-mono mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Error ID: {error.digest}
          </p>
        )}
        <button onClick={reset} className="btn btn-primary">
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    </div>
  );
}
