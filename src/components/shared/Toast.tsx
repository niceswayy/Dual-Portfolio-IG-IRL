"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useStore } from "@/store";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.3)", icon: "#22c55e" },
  error: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", icon: "#ef4444" },
  warning: { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", icon: "#f59e0b" },
  info: { bg: "rgba(99, 102, 241, 0.15)", border: "rgba(99, 102, 241, 0.3)", icon: "#6366f1" },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; type: "success" | "error" | "info" | "warning"; title: string; message?: string; duration?: number };
  onDismiss: () => void;
}) {
  const Icon = icons[toast.type];
  const color = colors[toast.type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <div
      className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl backdrop-blur-xl max-w-sm animate-slide-in"
      style={{
        background: color.bg,
        border: `1px solid ${color.border}`,
      }}
    >
      <Icon size={18} style={{ color: color.icon }} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 cursor-pointer opacity-60 hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
