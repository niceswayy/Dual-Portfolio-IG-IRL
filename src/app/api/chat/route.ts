import { NextRequest } from "next/server";
import { chatRequestSchema, validateRequest } from "@/lib/validation";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateRequest(chatRequestSchema, body);

    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const { message, systemPrompt, model, history } = validation.data;

    if (!OPENAI_API_KEY) {
      return Response.json(
        { error: "API key not configured. Set OPENAI_API_KEY in your .env file." },
        { status: 500 }
      );
    }

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history,
      { role: "user" as const, content: message },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let res: Response;
    try {
      res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: model || OPENAI_MODEL,
          messages,
          stream: true,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error && err.name === "AbortError"
        ? "Request timed out after 30 seconds"
        : "Failed to reach AI service";
      return Response.json({ error: msg }, { status: 504 });
    }

    clearTimeout(timeout);

    if (!res.ok) {
      // Sanitize — don't leak raw API error details
      const status = res.status;
      const genericErrors: Record<number, string> = {
        401: "Invalid API credentials",
        429: "Rate limit exceeded on AI service",
        500: "AI service internal error",
        503: "AI service temporarily unavailable",
      };
      return Response.json(
        { error: genericErrors[status] || `AI service error (${status})` },
        { status: Math.min(status, 503) }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(ctrl) {
        const reader = res.body?.getReader();
        if (!reader) { ctrl.close(); return; }

        let buffer = "";
        let totalTokens = 0;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;
              const data = trimmed.slice(6);
              if (data === "[DONE]") {
                ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, tokens: totalTokens })}\n\n`));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  totalTokens++;
                  ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        } finally {
          ctrl.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
