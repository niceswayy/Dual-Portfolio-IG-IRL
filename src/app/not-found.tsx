import Link from "next/link";
import { Brain, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="text-center">
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center glow-accent animate-float"
          style={{ background: "var(--accent)" }}
        >
          <Brain size={40} className="text-white" />
        </div>
        <h1 className="text-6xl font-bold font-mono mb-2" style={{ color: "var(--accent)" }}>
          404
        </h1>
        <h2 className="text-xl font-semibold mb-2">Neuron Not Found</h2>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          This synapse doesn&apos;t lead anywhere. Let&apos;s get you back on track.
        </p>
        <Link href="/dashboard" className="btn btn-primary inline-flex">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
