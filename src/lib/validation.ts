import { z } from "zod/v4";

// ── Chat API ──
export const chatRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  systemPrompt: z.string().max(8000).optional().default("You are a helpful AI assistant."),
  model: z.string().max(50).optional(),
  agentId: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(10000),
      })
    )
    .max(100)
    .optional()
    .default([]),
});

// ── MCP API ──
const PRIVATE_IP_REGEX =
  /^(https?:\/\/)?(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|0\.0\.0\.0|169\.254\.\d+\.\d+|\[::1\]|\[fc|fd)/i;

export const safeUrlSchema = z
  .url()
  .refine((url) => !PRIVATE_IP_REGEX.test(url), {
    message: "Private/internal URLs are not allowed (SSRF protection)",
  })
  .refine((url) => url.startsWith("https://") || url.startsWith("http://"), {
    message: "URL must use http or https protocol",
  });

export const mcpConnectSchema = z.object({
  id: z.string().min(1),
  action: z.literal("connect"),
  url: safeUrlSchema,
});

export const mcpCallSchema = z.object({
  serverId: z.string().min(1),
  url: safeUrlSchema,
  toolName: z.string().min(1).max(200),
  args: z.record(z.string(), z.unknown()).optional().default({}),
});

// ── Notion API ──
export const notionSyncSchema = z.object({
  action: z.literal("sync-project"),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
  status: z.enum(["active", "paused", "completed", "archived"]).optional().default("active"),
});

export const notionSearchSchema = z.object({
  action: z.literal("search"),
  query: z.string().min(1).max(200),
});

export const notionRequestSchema = z.discriminatedUnion("action", [
  notionSyncSchema,
  notionSearchSchema,
]);

// ── Automation API ──
export const automationRunSchema = z.object({
  automationId: z.string().min(1),
  triggerData: z.string().max(5000).optional().default(""),
});

// ── Audit API ──
export const auditRequestSchema = z.object({
  type: z.enum(["security", "visual", "full"]),
  baseUrl: z.string().optional(),
});

// ── Helper ──
export function validateRequest<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = result.error.issues.map(
    (i) => `${i.path.join(".")}: ${i.message}`
  );
  return { success: false, error: messages.join("; ") };
}
