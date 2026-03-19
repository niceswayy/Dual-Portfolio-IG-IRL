import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { id, action, url } = await req.json();

    if (action === "connect" && url) {
      // Try connecting to the MCP server
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
          params: {},
        }),
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Server responded with ${res.status}` },
          { status: 502 }
        );
      }

      const data = await res.json();
      return NextResponse.json({
        connected: true,
        tools: data.result?.tools || [],
        id,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Connection failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { serverId, url, toolName, args } = await req.json();

    if (!url || !toolName) {
      return NextResponse.json(
        { error: "url and toolName required" },
        { status: 400 }
      );
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: toolName, arguments: args || {} },
      }),
    });

    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ result: data.result, serverId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Tool call failed" },
      { status: 500 }
    );
  }
}
