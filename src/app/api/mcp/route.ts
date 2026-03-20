import { NextRequest, NextResponse } from "next/server";
import { mcpConnectSchema, mcpCallSchema, validateRequest } from "@/lib/validation";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateRequest(mcpConnectSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { id, url } = validation.data;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
          params: {},
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return NextResponse.json(
          { error: `MCP server responded with ${res.status}` },
          { status: 502 }
        );
      }

      const data = await res.json();
      return NextResponse.json({
        connected: true,
        tools: data.result?.tools || [],
        id,
      });
    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error && err.name === "AbortError"
        ? "Connection timed out after 10 seconds"
        : "Failed to connect to MCP server";
      return NextResponse.json({ error: msg }, { status: 504 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateRequest(mcpCallSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { serverId, url, toolName, args } = validation.data;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: { name: toolName, arguments: args },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (data.error) {
        return NextResponse.json({ error: data.error.message }, { status: 400 });
      }

      return NextResponse.json({ result: data.result, serverId });
    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error && err.name === "AbortError"
        ? "Tool call timed out"
        : "Tool call failed";
      return NextResponse.json({ error: msg }, { status: 504 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
