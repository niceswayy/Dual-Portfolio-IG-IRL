import { NextRequest } from "next/server";
import { automationRunSchema, validateRequest } from "@/lib/validation";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

interface StepDef {
  id: string;
  agentId: string;
  agentName: string;
  systemPrompt: string;
  model: string;
  input: string;
  order: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateRequest(automationRunSchema, body);

    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return Response.json({ error: "API key not configured" }, { status: 500 });
    }

    const { automationId, triggerData } = validation.data;
    const steps: StepDef[] = body.steps || [];

    if (steps.length === 0) {
      return Response.json({ error: "No steps provided" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(ctrl) {
        let prevOutput = triggerData || "";

        const emit = (event: object) => {
          ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          const startTime = Date.now();

          // Replace template variables
          let input = step.input
            .replace(/\{\{prev_output\}\}/g, prevOutput)
            .replace(/\{\{trigger_data\}\}/g, triggerData || "");

          emit({
            type: "step_start",
            stepId: step.id,
            stepIndex: i,
            agentName: step.agentName,
            input,
          });

          try {
            const messages = [
              { role: "system", content: step.systemPrompt || "You are a helpful assistant." },
              { role: "user", content: input },
            ];

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60_000);

            const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
              },
              body: JSON.stringify({
                model: step.model || OPENAI_MODEL,
                messages,
                stream: true,
                temperature: 0.7,
              }),
              signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!res.ok) {
              emit({
                type: "step_error",
                stepId: step.id,
                error: `AI service error (${res.status})`,
                duration: Date.now() - startTime,
              });
              break;
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No response body");

            const decoder = new TextDecoder();
            let buffer = "";
            let fullContent = "";
            let tokens = 0;

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
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullContent += content;
                    tokens++;
                    emit({ type: "step_token", stepId: step.id, content });
                  }
                } catch {
                  // skip
                }
              }
            }

            prevOutput = fullContent;

            emit({
              type: "step_complete",
              stepId: step.id,
              output: fullContent,
              tokens,
              duration: Date.now() - startTime,
            });
          } catch (err) {
            emit({
              type: "step_error",
              stepId: step.id,
              error: err instanceof Error ? err.message : "Step execution failed",
              duration: Date.now() - startTime,
            });
            break;
          }
        }

        emit({ type: "done", automationId });
        ctrl.close();
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
