import { NextRequest, NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const NOTION_VERSION = "2022-06-28";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

async function notionFetch(endpoint: string, options: RequestInit = {}) {
  return fetch(`https://api.notion.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export async function GET() {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return NextResponse.json(
      { error: "Notion not configured. Set NOTION_API_KEY and NOTION_DATABASE_ID." },
      { status: 400 }
    );
  }

  try {
    const res = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return NextResponse.json(
      { error: "Notion not configured" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { action, ...payload } = body;

    if (action === "sync-project") {
      const res = await notionFetch("/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: { database_id: NOTION_DATABASE_ID },
          properties: {
            Name: { title: [{ text: { content: payload.name } }] },
            Description: {
              rich_text: [{ text: { content: payload.description || "" } }],
            },
            Status: { select: { name: payload.status || "active" } },
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: err }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json({ pageId: data.id, url: data.url });
    }

    if (action === "search") {
      const res = await notionFetch("/search", {
        method: "POST",
        body: JSON.stringify({ query: payload.query }),
      });

      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
