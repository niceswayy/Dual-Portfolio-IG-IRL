"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, SkipForward } from "lucide-react";

// ── Neural Network Animation Engine ──
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  connections: number[];
}

interface NeuralNode {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  pulsePhase: number;
  active: boolean;
  color: string;
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#22c55e"];

function createParticles(w: number, h: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    radius: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    connections: [],
  }));
}

function createNodes(w: number, h: number, count: number): NeuralNode[] {
  const cx = w / 2;
  const cy = h / 2;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const layer = Math.floor(i / 6);
    const radius = 120 + layer * 80;
    return {
      x: cx,
      y: cy,
      targetX: cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
      targetY: cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
      radius: 4 + Math.random() * 4,
      pulsePhase: Math.random() * Math.PI * 2,
      active: false,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  });
}

export default function WelcomePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(0); // 0=particles, 1=network, 2=logo, 3=ready
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [subtitleOpacity, setSubtitleOpacity] = useState(0);
  const [buttonOpacity, setButtonOpacity] = useState(0);
  const animFrameRef = useRef<number>(0);

  const enter = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("braincells-intro-seen", "1");
    }
    router.push("/dashboard");
  }, [router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const particles = createParticles(w, h, 80);
    const nodes = createNodes(w, h, 18);
    let startTime = performance.now();
    let currentPhase = 0;

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, w, h);

      // Background gradient
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
      bg.addColorStop(0, "#0d0d1a");
      bg.addColorStop(1, "#0a0a0f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Phase transitions
      if (elapsed > 0.5 && currentPhase < 1) { currentPhase = 1; setPhase(1); }
      if (elapsed > 2.0 && currentPhase < 2) { currentPhase = 2; setPhase(2); }
      if (elapsed > 3.0 && currentPhase < 3) { currentPhase = 3; setPhase(3); }

      // ── Draw particles ──
      const particleFade = Math.min(1, elapsed / 1.0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * particleFade * (currentPhase >= 2 ? 0.3 : 1);
        ctx.fill();
      }

      // ── Draw particle connections ──
      ctx.globalAlpha = particleFade * 0.15 * (currentPhase >= 2 ? 0.3 : 1);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // ── Draw neural nodes ──
      if (currentPhase >= 1) {
        const nodeProgress = Math.min(1, (elapsed - 0.5) / 1.5);
        const eased = 1 - Math.pow(1 - nodeProgress, 3); // ease-out cubic

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.x += (node.targetX - node.x) * 0.05;
          node.y += (node.targetY - node.y) * 0.05;

          // Connections to nearby nodes
          for (let j = i + 1; j < nodes.length; j++) {
            const other = nodes[j];
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
              const connAlpha = (1 - dist / 200) * 0.4 * eased;
              ctx.globalAlpha = connAlpha;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = node.color;
              ctx.lineWidth = 1.5;
              ctx.setLineDash([4, 4]);
              ctx.lineDashOffset = -elapsed * 30;
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }

          // Node glow
          const pulse = Math.sin(elapsed * 2 + node.pulsePhase) * 0.3 + 0.7;
          ctx.globalAlpha = eased * 0.3;
          const glow = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, node.radius * 4
          );
          glow.addColorStop(0, node.color + "60");
          glow.addColorStop(1, node.color + "00");
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Node circle
          ctx.globalAlpha = eased * pulse;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      // ── Animate logo/subtitle/button opacity ──
      if (currentPhase >= 2) {
        const logoProgress = Math.min(1, (elapsed - 2.0) / 0.8);
        setLogoOpacity(logoProgress);
      }
      if (currentPhase >= 2 && elapsed > 2.5) {
        const subProgress = Math.min(1, (elapsed - 2.5) / 0.8);
        setSubtitleOpacity(subProgress);
      }
      if (currentPhase >= 3) {
        const btnProgress = Math.min(1, (elapsed - 3.0) / 0.6);
        setButtonOpacity(btnProgress);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#0a0a0f" }}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Logo */}
        <div
          className="flex items-center gap-4 mb-4 transition-transform"
          style={{
            opacity: logoOpacity,
            transform: `scale(${0.8 + logoOpacity * 0.2})`,
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "var(--accent)",
              boxShadow: `0 0 ${40 * logoOpacity}px var(--accent-glow)`,
            }}
          >
            <Brain size={36} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Braincells</h1>
        </div>

        {/* Subtitle */}
        <p
          className="text-lg mb-10"
          style={{
            opacity: subtitleOpacity,
            color: "var(--text-secondary)",
            transform: `translateY(${(1 - subtitleOpacity) * 10}px)`,
          }}
        >
          Agent Orchestration Interface
        </p>

        {/* Enter button */}
        <button
          onClick={enter}
          className="btn btn-primary text-base px-8 py-3 cursor-pointer"
          style={{
            opacity: buttonOpacity,
            transform: `translateY(${(1 - buttonOpacity) * 20}px)`,
            boxShadow: `0 0 ${30 * buttonOpacity}px var(--accent-glow)`,
          }}
        >
          Enter Braincells <ArrowRight size={18} />
        </button>
      </div>

      {/* Skip button */}
      {phase < 3 && (
        <button
          onClick={enter}
          className="absolute top-6 right-6 z-20 flex items-center gap-2 text-sm px-4 py-2 rounded-lg cursor-pointer transition-opacity hover:opacity-100"
          style={{
            color: "var(--text-secondary)",
            opacity: 0.5,
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <SkipForward size={14} /> Skip
        </button>
      )}
    </div>
  );
}
