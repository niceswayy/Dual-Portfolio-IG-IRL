import { NextResponse, type NextRequest } from "next/server";

// ── Rate Limiter (in-memory, per-IP) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 120; // requests
const RATE_WINDOW = 60_000; // 1 minute

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
  }, 300_000);
}

// ── SSRF Protection ──
const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\.0\.0\.0$/,
  /^169\.254\./,
  /^\[::1\]$/,
  /^\[fc/i,
  /^\[fd/i,
];

function isPrivateUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return PRIVATE_IP_PATTERNS.some((p) => p.test(url.hostname));
  } catch {
    return true; // malformed URLs are blocked
  }
}

// ── Security Headers ──
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.openai.com https://api.notion.com",
};

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  // Rate limiting on API routes
  if (isApiRoute) {
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            ...SECURITY_HEADERS,
          },
        }
      );
    }

    // SSRF protection for MCP routes
    if (pathname === "/api/mcp" && request.method !== "GET") {
      // We'll validate URL in the route handler with Zod, but add an extra check here
      // Body is consumed by route handler, so we just add headers
    }
  }

  // Apply security headers to all responses
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Log API requests
  if (isApiRoute) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${request.method} ${pathname} [${ip}]`);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
