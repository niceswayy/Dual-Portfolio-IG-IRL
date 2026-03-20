import { NextRequest } from "next/server";
import { auditRequestSchema, validateRequest } from "@/lib/validation";
import {
  runSecurityAudit,
  getScannerNames,
  calculateScore,
  buildSummary,
} from "@/lib/audit/security-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateRequest(auditRequestSchema, body);

    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const { type, baseUrl } = validation.data;
    const url = baseUrl || `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    if (type === "visual") {
      // Visual audits run client-side — return instruction
      return Response.json({
        message: "Visual audits run client-side. Use the visual audit engine directly.",
        type: "visual",
      });
    }

    // Security or Full audit — stream results
    const encoder = new TextEncoder();
    const scannerNames = getScannerNames();

    const stream = new ReadableStream({
      async start(ctrl) {
        const emit = (event: object) => {
          ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        emit({
          type: "start",
          scanners: scannerNames,
          total: scannerNames.length,
        });

        const results = await runSecurityAudit(url, (scannerName, scannerResults) => {
          emit({
            type: "scanner_complete",
            scanner: scannerName,
            results: scannerResults,
          });
        });

        const score = calculateScore(results);
        const summary = buildSummary(results);

        emit({
          type: "done",
          results,
          score,
          summary,
          total: results.length,
        });

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
    return Response.json({ error: "Audit failed" }, { status: 500 });
  }
}
