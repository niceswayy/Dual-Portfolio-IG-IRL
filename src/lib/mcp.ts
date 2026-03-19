import type { MCPServer, MCPTool } from "@/types";

// In-memory MCP server registry (in production, use a database)
const mcpRegistry = new Map<string, MCPServer>();

export function registerMCPServer(server: MCPServer): void {
  mcpRegistry.set(server.id, server);
}

export function getMCPServer(id: string): MCPServer | undefined {
  return mcpRegistry.get(id);
}

export function getAllMCPServers(): MCPServer[] {
  return Array.from(mcpRegistry.values());
}

export function removeMCPServer(id: string): boolean {
  return mcpRegistry.delete(id);
}

export async function connectToMCPServer(
  server: MCPServer
): Promise<MCPTool[]> {
  // For SSE/HTTP transports, attempt connection
  if (server.transport === "sse" || server.transport === "streamable-http") {
    if (!server.url) throw new Error("URL required for SSE/HTTP transport");

    try {
      const res = await fetch(server.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
          params: {},
        }),
      });

      if (!res.ok) throw new Error(`MCP server responded with ${res.status}`);

      const data = await res.json();
      const tools: MCPTool[] = (data.result?.tools || []).map(
        (t: { name: string; description?: string; inputSchema?: object }) => ({
          name: t.name,
          description: t.description || "",
          inputSchema: t.inputSchema || {},
        })
      );

      server.tools = tools;
      server.connected = true;
      server.lastPing = new Date().toISOString();
      registerMCPServer(server);

      return tools;
    } catch (err) {
      server.connected = false;
      registerMCPServer(server);
      throw err;
    }
  }

  // For stdio, we register but can't connect from the browser
  server.connected = false;
  registerMCPServer(server);
  return server.tools || [];
}

export async function callMCPTool(
  serverId: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const server = getMCPServer(serverId);
  if (!server) throw new Error(`MCP server ${serverId} not found`);
  if (!server.connected) throw new Error(`MCP server ${serverId} not connected`);

  if (server.transport === "sse" || server.transport === "streamable-http") {
    const res = await fetch(server.url!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: toolName, arguments: args },
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
  }

  throw new Error("stdio transport not supported in browser context");
}

// Build MCP context string for agent system prompts
export function buildMCPContext(serverIds: string[]): string {
  const servers = serverIds
    .map((id) => getMCPServer(id))
    .filter(Boolean) as MCPServer[];

  if (servers.length === 0) return "";

  let context = "\n\n## Available MCP Tools\n";
  for (const server of servers) {
    context += `\n### ${server.name}\n`;
    for (const tool of server.tools) {
      context += `- **${tool.name}**: ${tool.description}\n`;
    }
  }
  return context;
}
