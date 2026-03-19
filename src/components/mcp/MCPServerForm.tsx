"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { MCPServer } from "@/types";
import { useStore } from "@/store";
import Modal from "@/components/shared/Modal";

interface MCPServerFormProps {
  open: boolean;
  onClose: () => void;
  editServer?: MCPServer | null;
}

export default function MCPServerForm({ open, onClose, editServer }: MCPServerFormProps) {
  const { addMcpServer, updateMcpServer } = useStore();

  const [name, setName] = useState(editServer?.name || "");
  const [transport, setTransport] = useState<MCPServer["transport"]>(
    editServer?.transport || "sse"
  );
  const [url, setUrl] = useState(editServer?.url || "");
  const [command, setCommand] = useState(editServer?.command || "");
  const [args, setArgs] = useState(editServer?.args?.join(" ") || "");
  const [envText, setEnvText] = useState(
    editServer?.env
      ? Object.entries(editServer.env)
          .map(([k, v]) => `${k}=${v}`)
          .join("\n")
      : ""
  );

  const handleSubmit = () => {
    if (!name.trim()) return;

    const env: Record<string, string> = {};
    envText.split("\n").forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key?.trim()) env[key.trim()] = rest.join("=").trim();
    });

    const server: MCPServer = {
      id: editServer?.id || uuid(),
      name,
      transport,
      url: transport !== "stdio" ? url : undefined,
      command: transport === "stdio" ? command : undefined,
      args: transport === "stdio" ? args.split(" ").filter(Boolean) : undefined,
      env: Object.keys(env).length > 0 ? env : undefined,
      tools: editServer?.tools || [],
      connected: editServer?.connected || false,
      lastPing: editServer?.lastPing,
    };

    if (editServer) {
      updateMcpServer(editServer.id, server);
    } else {
      addMcpServer(server);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editServer ? "Edit MCP Server" : "Add MCP Server"}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Name
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Server name..." className="w-full" />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Transport
          </label>
          <select value={transport} onChange={(e) => setTransport(e.target.value as MCPServer["transport"])} className="w-full">
            <option value="sse">SSE (Server-Sent Events)</option>
            <option value="streamable-http">Streamable HTTP</option>
            <option value="stdio">Stdio</option>
          </select>
        </div>

        {transport !== "stdio" ? (
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              URL
            </label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://localhost:3001/mcp" className="w-full" />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Command
              </label>
              <input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="npx" className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Arguments
              </label>
              <input value={args} onChange={(e) => setArgs(e.target.value)} placeholder="-y @mcp/server" className="w-full" />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Environment Variables
          </label>
          <textarea
            value={envText}
            onChange={(e) => setEnvText(e.target.value)}
            rows={3}
            placeholder={"API_KEY=xxx\nOTHER_VAR=yyy"}
            className="w-full resize-none font-mono text-xs"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary">
            {editServer ? "Save" : "Add Server"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
