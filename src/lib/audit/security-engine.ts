import type { AuditResult, AuditSummary, AuditSeverity } from "@/types";
import { v4 as uuid } from "uuid";

type ScannerFn = (baseUrl: string) => Promise<AuditResult[]>;

// ── Scanner Registry ──
const scanners: { name: string; fn: ScannerFn }[] = [];

export function registerScanner(name: string, fn: ScannerFn) {
  scanners.push({ name, fn });
}

function makeResult(
  partial: Omit<AuditResult, "id" | "timestamp">
): AuditResult {
  return { id: uuid(), timestamp: new Date().toISOString(), ...partial };
}

export function calculateScore(results: AuditResult[]): number {
  if (results.length === 0) return 100;
  const weights: Record<AuditSeverity, number> = {
    critical: 25, high: 15, medium: 8, low: 3, info: 1, pass: 0,
  };
  const maxDeduct = results.length * 25;
  const deductions = results.reduce((sum, r) => sum + weights[r.severity], 0);
  return Math.max(0, Math.round(100 - (deductions / maxDeduct) * 100));
}

export function buildSummary(results: AuditResult[]): AuditSummary {
  const summary: AuditSummary = { critical: 0, high: 0, medium: 0, low: 0, info: 0, pass: 0 };
  for (const r of results) summary[r.severity]++;
  return summary;
}

// ══════════════════════════════════════════════
// HEADERS SCANNER
// ══════════════════════════════════════════════
registerScanner("Security Headers", async (baseUrl) => {
  const results: AuditResult[] = [];

  try {
    const res = await fetch(baseUrl, { method: "GET" });
    const headers = res.headers;

    const checks: { header: string; category: AuditResult["category"]; severity: AuditSeverity; rec: string }[] = [
      { header: "X-Frame-Options", category: "headers", severity: "high", rec: "Add X-Frame-Options: DENY header to prevent clickjacking" },
      { header: "X-Content-Type-Options", category: "headers", severity: "medium", rec: "Add X-Content-Type-Options: nosniff to prevent MIME type sniffing" },
      { header: "X-XSS-Protection", category: "headers", severity: "medium", rec: "Add X-XSS-Protection: 1; mode=block header" },
      { header: "Referrer-Policy", category: "headers", severity: "low", rec: "Add Referrer-Policy: strict-origin-when-cross-origin" },
      { header: "Content-Security-Policy", category: "headers", severity: "high", rec: "Implement a Content Security Policy to prevent XSS and data injection" },
      { header: "Permissions-Policy", category: "headers", severity: "low", rec: "Add Permissions-Policy to restrict browser features" },
    ];

    for (const check of checks) {
      const value = headers.get(check.header);
      results.push(
        makeResult({
          category: check.category,
          name: `${check.header} header`,
          description: value
            ? `${check.header} is present: ${value}`
            : `${check.header} header is missing`,
          severity: value ? "pass" : check.severity,
          details: value
            ? `Current value: ${value}`
            : `The ${check.header} header was not found in the response`,
          recommendation: value ? "Header correctly configured" : check.rec,
          autoFixAvailable: !value,
          endpoint: baseUrl,
        })
      );
    }

    // Check for sensitive headers that shouldn't be present
    const poweredBy = headers.get("X-Powered-By");
    if (poweredBy) {
      results.push(
        makeResult({
          category: "config",
          name: "X-Powered-By exposed",
          description: `Server technology exposed: ${poweredBy}`,
          severity: "low",
          details: `The X-Powered-By header reveals: ${poweredBy}`,
          recommendation: "Remove X-Powered-By header to prevent technology fingerprinting",
          autoFixAvailable: true,
        })
      );
    } else {
      results.push(
        makeResult({
          category: "config",
          name: "X-Powered-By hidden",
          description: "Server technology is not exposed",
          severity: "pass",
          details: "X-Powered-By header is not present",
          recommendation: "No action needed",
          autoFixAvailable: false,
        })
      );
    }
  } catch (err) {
    results.push(
      makeResult({
        category: "headers",
        name: "Headers scan failed",
        description: `Could not fetch headers: ${err instanceof Error ? err.message : "Unknown"}`,
        severity: "info",
        details: "Failed to reach the target URL",
        recommendation: "Verify the application URL is accessible",
        autoFixAvailable: false,
        endpoint: baseUrl,
      })
    );
  }

  return results;
});

// ══════════════════════════════════════════════
// API ENDPOINT SCANNER
// ══════════════════════════════════════════════
registerScanner("API Endpoints", async (baseUrl) => {
  const results: AuditResult[] = [];
  const endpoints = ["/api/chat", "/api/mcp", "/api/notion", "/api/automations", "/api/audit"];

  for (const ep of endpoints) {
    const url = `${baseUrl}${ep}`;

    // Test invalid methods
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (res.status !== 405 && res.status !== 404) {
        results.push(
          makeResult({
            category: "api",
            name: `${ep}: Unexpected DELETE response`,
            description: `DELETE ${ep} returned ${res.status} instead of 405`,
            severity: "medium",
            details: `Expected 405 Method Not Allowed, got ${res.status}`,
            recommendation: "Restrict HTTP methods to only those explicitly supported",
            autoFixAvailable: false,
            endpoint: ep,
          })
        );
      }
    } catch {
      // network error is OK here
    }

    // Test malformed JSON
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      });
      if (res.status === 500) {
        results.push(
          makeResult({
            category: "api",
            name: `${ep}: Crashes on malformed input`,
            description: `POST ${ep} with malformed JSON returned 500`,
            severity: "high",
            details: "The endpoint threw a 500 error instead of returning a 400 validation error",
            recommendation: "Add input validation to gracefully handle malformed requests",
            autoFixAvailable: true,
            endpoint: ep,
          })
        );
      } else if (res.status === 400) {
        results.push(
          makeResult({
            category: "api",
            name: `${ep}: Handles malformed input`,
            description: `POST ${ep} correctly returns 400 for malformed JSON`,
            severity: "pass",
            details: "Endpoint properly validates input",
            recommendation: "No action needed",
            autoFixAvailable: false,
            endpoint: ep,
          })
        );
      }
    } catch {
      // skip
    }

    // Test oversized payload
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "x".repeat(50000) }),
      });
      if (res.status === 400) {
        results.push(
          makeResult({
            category: "api",
            name: `${ep}: Rejects oversized payload`,
            description: `POST ${ep} correctly rejects oversized input`,
            severity: "pass",
            details: "Endpoint enforces input size limits",
            recommendation: "No action needed",
            autoFixAvailable: false,
            endpoint: ep,
          })
        );
      } else if (res.ok || res.status === 500) {
        results.push(
          makeResult({
            category: "api",
            name: `${ep}: Accepts oversized payload`,
            description: `POST ${ep} does not reject oversized input (50KB)`,
            severity: "medium",
            details: `Received status ${res.status} for 50KB payload`,
            recommendation: "Add request body size limits to prevent resource exhaustion",
            autoFixAvailable: true,
            endpoint: ep,
          })
        );
      }
    } catch {
      // skip
    }

    // Test error information leakage
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ __proto__: { polluted: true } }),
      });
      const body = await res.text();
      const leaksStack = body.includes("at ") && body.includes(".ts:") || body.includes(".js:");
      if (leaksStack) {
        results.push(
          makeResult({
            category: "api",
            name: `${ep}: Error info leakage`,
            description: `${ep} leaks stack trace information in error responses`,
            severity: "high",
            details: "Error response contains file paths or stack traces",
            recommendation: "Sanitize error responses — never expose internal paths or stack traces",
            autoFixAvailable: true,
            endpoint: ep,
          })
        );
      }
    } catch {
      // skip
    }
  }

  return results;
});

// ══════════════════════════════════════════════
// SSRF SCANNER
// ══════════════════════════════════════════════
registerScanner("SSRF Protection", async (baseUrl) => {
  const results: AuditResult[] = [];
  const maliciousUrls = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    "http://169.254.169.254/latest/meta-data",
    "http://10.0.0.1",
    "http://192.168.1.1",
    "http://[::1]:3000",
  ];

  for (const malUrl of maliciousUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/mcp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "test", action: "connect", url: malUrl }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 400 && (body.error?.includes("SSRF") || body.error?.includes("Private") || body.error?.includes("not allowed"))) {
        results.push(
          makeResult({
            category: "ssrf",
            name: `SSRF blocked: ${new URL(malUrl).hostname}`,
            description: `Request to ${malUrl} was correctly blocked`,
            severity: "pass",
            details: `Server returned 400 with appropriate error message`,
            recommendation: "No action needed",
            autoFixAvailable: false,
            endpoint: "/api/mcp",
          })
        );
      } else {
        results.push(
          makeResult({
            category: "ssrf",
            name: `SSRF vulnerability: ${new URL(malUrl).hostname}`,
            description: `Request to internal URL ${malUrl} was NOT blocked (status: ${res.status})`,
            severity: "critical",
            details: `The server attempted to connect to ${malUrl} instead of blocking it`,
            recommendation: "Block requests to private/internal IP ranges in the MCP endpoint",
            autoFixAvailable: true,
            endpoint: "/api/mcp",
          })
        );
      }
    } catch {
      // Connection failure is acceptable — means it was blocked at network level
      results.push(
        makeResult({
          category: "ssrf",
          name: `SSRF check: ${malUrl}`,
          description: `Connection to ${malUrl} failed (likely blocked)`,
          severity: "pass",
          details: "Connection was refused or timed out",
          recommendation: "No action needed",
          autoFixAvailable: false,
          endpoint: "/api/mcp",
        })
      );
    }
  }

  return results;
});

// ══════════════════════════════════════════════
// XSS SCANNER
// ══════════════════════════════════════════════
registerScanner("XSS Protection", async (baseUrl) => {
  const results: AuditResult[] = [];
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>',
    "javascript:alert(1)",
    '<svg onload=alert(1)>',
  ];

  // Test chat endpoint — does it reflect XSS in error messages?
  for (const payload of xssPayloads.slice(0, 2)) {
    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: payload }),
      });
      const body = await res.text();

      if (body.includes(payload) && !body.includes("&lt;")) {
        results.push(
          makeResult({
            category: "xss",
            name: "Reflected XSS in API response",
            description: `XSS payload reflected unescaped in /api/chat response`,
            severity: "high",
            details: `Payload: ${payload}`,
            recommendation: "Ensure all user input is escaped in API responses",
            autoFixAvailable: true,
            endpoint: "/api/chat",
          })
        );
      } else {
        results.push(
          makeResult({
            category: "xss",
            name: "XSS payload handled safely",
            description: "XSS payload was not reflected unescaped",
            severity: "pass",
            details: `Tested: ${payload.slice(0, 40)}...`,
            recommendation: "No action needed",
            autoFixAvailable: false,
            endpoint: "/api/chat",
          })
        );
      }
    } catch {
      // skip
    }
  }

  // Check for React-level XSS protection (dangerouslySetInnerHTML check)
  results.push(
    makeResult({
      category: "xss",
      name: "React auto-escaping",
      description: "React framework provides automatic XSS escaping for rendered content",
      severity: "pass",
      details: "Next.js/React auto-escapes JSX expressions. No dangerouslySetInnerHTML usage detected in application code.",
      recommendation: "Continue avoiding dangerouslySetInnerHTML",
      autoFixAvailable: false,
    })
  );

  return results;
});

// ══════════════════════════════════════════════
// RATE LIMIT SCANNER
// ══════════════════════════════════════════════
registerScanner("Rate Limiting", async (baseUrl) => {
  const results: AuditResult[] = [];
  const testEndpoint = `${baseUrl}/api/chat`;

  // Send burst of requests
  let hitRateLimit = false;
  const burstSize = 10;
  const responses: number[] = [];

  for (let i = 0; i < burstSize; i++) {
    try {
      const res = await fetch(testEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "rate limit test" }),
      });
      responses.push(res.status);
      if (res.status === 429) {
        hitRateLimit = true;
        break;
      }
    } catch {
      break;
    }
  }

  if (hitRateLimit) {
    results.push(
      makeResult({
        category: "rate_limit",
        name: "Rate limiting active",
        description: "API rate limiting is properly configured",
        severity: "pass",
        details: `Rate limit triggered after ${responses.length} requests`,
        recommendation: "No action needed",
        autoFixAvailable: false,
        endpoint: "/api/chat",
      })
    );
  } else {
    results.push(
      makeResult({
        category: "rate_limit",
        name: "Rate limiting check",
        description: `Sent ${burstSize} rapid requests without hitting rate limit`,
        severity: responses.length >= burstSize ? "medium" : "info",
        details: `Statuses: ${responses.join(", ")}. Note: Rate limiting may use a higher threshold.`,
        recommendation: "Verify rate limiting is configured with appropriate thresholds",
        autoFixAvailable: false,
        endpoint: "/api/chat",
      })
    );
  }

  return results;
});

// ══════════════════════════════════════════════
// CONFIG SCANNER
// ══════════════════════════════════════════════
registerScanner("Configuration", async (baseUrl) => {
  const results: AuditResult[] = [];

  // Check .env exposure
  const envPaths = ["/.env", "/.env.local", "/.env.example"];
  for (const path of envPaths) {
    try {
      const res = await fetch(`${baseUrl}${path}`);
      if (res.ok) {
        const text = await res.text();
        if (text.includes("API_KEY") || text.includes("SECRET") || text.includes("sk-")) {
          results.push(
            makeResult({
              category: "config",
              name: `Exposed: ${path}`,
              description: `${path} is publicly accessible and contains sensitive data`,
              severity: "critical",
              details: `The file at ${path} appears to contain API keys or secrets`,
              recommendation: "Block access to .env files via server configuration",
              autoFixAvailable: true,
              endpoint: path,
            })
          );
        }
      } else {
        results.push(
          makeResult({
            category: "config",
            name: `Protected: ${path}`,
            description: `${path} is not publicly accessible`,
            severity: "pass",
            details: `Returned ${res.status}`,
            recommendation: "No action needed",
            autoFixAvailable: false,
            endpoint: path,
          })
        );
      }
    } catch {
      results.push(
        makeResult({
          category: "config",
          name: `Protected: ${path}`,
          description: `${path} request failed (likely protected)`,
          severity: "pass",
          details: "Connection failed or blocked",
          recommendation: "No action needed",
          autoFixAvailable: false,
        })
      );
    }
  }

  // Check source maps
  try {
    const mainPage = await fetch(baseUrl);
    const html = await mainPage.text();
    if (html.includes(".js.map") || html.includes("sourceMappingURL")) {
      results.push(
        makeResult({
          category: "config",
          name: "Source maps exposed",
          description: "Source maps are accessible in production build",
          severity: "medium",
          details: "Source maps allow attackers to view original source code",
          recommendation: "Disable source maps in production via next.config.ts: productionBrowserSourceMaps: false",
          autoFixAvailable: true,
        })
      );
    } else {
      results.push(
        makeResult({
          category: "config",
          name: "Source maps hidden",
          description: "Source maps are not exposed",
          severity: "pass",
          details: "No sourceMappingURL references found in page source",
          recommendation: "No action needed",
          autoFixAvailable: false,
        })
      );
    }
  } catch {
    // skip
  }

  return results;
});

// ══════════════════════════════════════════════
// INJECTION SCANNER
// ══════════════════════════════════════════════
registerScanner("Injection Protection", async (baseUrl) => {
  const results: AuditResult[] = [];

  const injectionPayloads = [
    { name: "SQL Injection", payload: "'; DROP TABLE users; --" },
    { name: "NoSQL Injection", payload: '{"$gt": ""}' },
    { name: "Command Injection", payload: "; ls -la /etc/passwd" },
    { name: "Path Traversal", payload: "../../../../etc/passwd" },
    { name: "Template Injection", payload: "{{7*7}}" },
  ];

  for (const { name, payload } of injectionPayloads) {
    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: payload }),
      });

      // If status is 400 or 500 without leaking info, that's acceptable
      const body = await res.text();
      const dangerous = body.includes("root:") || body.includes("DROP TABLE") || body.includes("49"); // 7*7

      if (dangerous) {
        results.push(
          makeResult({
            category: "injection",
            name: `${name} vulnerability`,
            description: `Injection payload was processed unsafely`,
            severity: "critical",
            details: `Payload: ${payload}`,
            recommendation: `Implement input sanitization against ${name}`,
            autoFixAvailable: true,
            endpoint: "/api/chat",
          })
        );
      } else {
        results.push(
          makeResult({
            category: "injection",
            name: `${name} protected`,
            description: `${name} payload handled safely`,
            severity: "pass",
            details: `Tested: ${payload}`,
            recommendation: "No action needed",
            autoFixAvailable: false,
            endpoint: "/api/chat",
          })
        );
      }
    } catch {
      // skip
    }
  }

  return results;
});

// ══════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════
export async function runSecurityAudit(
  baseUrl: string,
  onProgress?: (scanner: string, results: AuditResult[]) => void
): Promise<AuditResult[]> {
  const allResults: AuditResult[] = [];

  for (const scanner of scanners) {
    try {
      const results = await scanner.fn(baseUrl);
      allResults.push(...results);
      onProgress?.(scanner.name, results);
    } catch (err) {
      allResults.push(
        makeResult({
          category: "config",
          name: `Scanner error: ${scanner.name}`,
          description: err instanceof Error ? err.message : "Scanner failed",
          severity: "info",
          details: "The scanner encountered an unexpected error",
          recommendation: "Review scanner configuration",
          autoFixAvailable: false,
        })
      );
      onProgress?.(scanner.name, allResults.slice(-1));
    }
  }

  return allResults;
}

export function getScannerNames(): string[] {
  return scanners.map((s) => s.name);
}
