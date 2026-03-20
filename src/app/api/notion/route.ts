import { NextRequest, NextResponse } from "next/server";
import { notionRequestSchema, validateRequest } from "@/lib/validation";

const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const NOTION_VERSION = "2022-06-28";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

async function notionFetch(endpoint: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
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
      return NextResponse.json(
        { error: "Failed to query Notion database" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Notion request failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return NextResponse.json({ error: "Notion not configured" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validation = validateRequest(notionRequestSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data;

    if (data.action === "sync-project") {
      const res = await notionFetch("/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: { database_id: NOTION_DATABASE_ID },
          properties: {
            Name: { title: [{ text: { content: data.name } }] },
            Description: {
              rich_text: [{ text: { content: data.description } }],
            },
            Status: { select: { name: data.status } },
          },
        }),
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: "Failed to sync project to Notion" },
          { status: res.status }
        );
      }

      const result = await res.json();
      return NextResponse.json({ pageId: result.id, url: result.url });
    }

    if (data.action === "search") {
      const res = await notionFetch("/search", {
        method: "POST",
        body: JSON.stringify({ query: data.query }),
      });

      const result = await res.json();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Notion request failed" }, { status: 500 });
  }
}
