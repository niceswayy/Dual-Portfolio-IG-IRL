"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User } from "lucide-react";
import { v4 as uuid } from "uuid";
import { useStore } from "@/store";
import type { ChatMessage } from "@/types";

interface ChatPanelProps {
  agentId: string;
  onClose: () => void;
}

export default function ChatPanel({ agentId, onClose }: ChatPanelProps) {
  const { agents, messages, addMessage, updateMessage, updateAgent } = useStore();
  const agent = agents.find((a) => a.id === agentId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const agentMessages = messages.filter(
    (m) => m.agentId === agentId || (!m.agentId && m.role === "user")
  );

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [agentMessages.length]);

  if (!agent) return null;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      content: input,
      agentId,
      agentName: agent.name,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput("");
    setLoading(true);
    updateAgent(agentId, { status: "running" });

    const assistantId = uuid();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      agentId,
      agentName: agent.name,
      timestamp: new Date().toISOString(),
      streaming: true,
    };
    addMessage(assistantMsg);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          message: input,
          systemPrompt: agent.systemPrompt,
          model: agent.model,
          history: agentMessages.filter((m) => !m.streaming).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              updateMessage(assistantId, { content: fullContent });
            }
            if (parsed.tokens) {
              updateAgent(agentId, {
                tokensUsed: agent.tokensUsed + parsed.tokens,
              });
            }
          } catch {
            // skip
          }
        }
      }

      updateMessage(assistantId, { streaming: false, content: fullContent });
      updateAgent(agentId, {
        status: "idle",
        lastActivity: new Date().toISOString(),
      });
    } catch (err) {
      updateMessage(assistantId, {
        content: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        streaming: false,
      });
      updateAgent(agentId, { status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed right-0 top-0 h-screen w-[480px] z-50 flex flex-col"
      style={{
        background: "var(--bg-secondary)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${agent.color}20`, color: agent.color }}
          >
            <Bot size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{agent.name}</h3>
            <div className={`status-dot ${agent.status} inline-block`} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {agentMessages.length === 0 && (
          <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
            <Bot size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Start a conversation with {agent.name}</p>
          </div>
        )}

        {agentMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-1"
                style={{ background: `${agent.color}20`, color: agent.color }}
              >
                <Bot size={14} />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user" ? "" : ""
              } ${msg.streaming ? "animate-pulse-glow" : ""}`}
              style={{
                background:
                  msg.role === "user" ? "var(--accent)" : "var(--bg-tertiary)",
                color: msg.role === "user" ? "white" : "var(--text-primary)",
              }}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content || "..."}</p>
            </div>
            {msg.role === "user" && (
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-1"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <User size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Message..."
            className="flex-1"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn btn-primary px-3"
            style={{ opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
