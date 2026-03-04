import { Hono } from "hono";
import { getAllPublishedGuides } from "@repo/data-ops/queries";
import {
  getAuthInstance,
  authMiddleware,
  accessMiddleware,
} from "./helpers/auth-instance";
import { authRateLimiter, trpcRateLimiter, publicRateLimiter } from "./helpers/rate-limiter";
import {
  authenticatedTrpcHandler,
  publicTrpcHandler,
  PUBLIC_TRPC_ROUTES,
  SESSION_ONLY_ROUTES,
} from "./helpers/trpc-routes";

export const App = new Hono<{
  Bindings: ServiceBindings & {
    AUTH_RATE_LIMITER: RateLimit;
    TRPC_RATE_LIMITER: RateLimit;
  };
  Variables: { userId: string };
}>();

const PRODUCTION_HOSTS = new Set(["stepps.ai", "www.stepps.ai"]);
const INDEXABLE_STATIC_PATHS = ["/", "/guides", "/payments", "/webinar", "/privacy", "/terms"];

function toIsoDate(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

App.get("/robots.txt", async (c) => {
  const hostname = new URL(c.req.url).hostname.toLowerCase();

  if (!PRODUCTION_HOSTS.has(hostname)) {
    return c.text("User-agent: *\nDisallow: /\n", 200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    });
  }

  const robots = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /app/",
    "Disallow: /auth/",
    "Disallow: /api/",
    "Disallow: /trpc/",
    "Disallow: /payment/success",
    "Disallow: /payment/cancel",
    "",
    "Sitemap: https://stepps.ai/sitemap.xml",
  ].join("\n");

  return c.text(robots, 200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

App.get("/sitemap.xml", async (c) => {
  const hostname = new URL(c.req.url).hostname.toLowerCase();

  if (!PRODUCTION_HOSTS.has(hostname)) {
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    return c.text(emptySitemap, 200, {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    });
  }

  const baseUrl = "https://stepps.ai";
  const now = toIsoDate(new Date()) ?? new Date().toISOString().split("T")[0];

  let guides: Awaited<ReturnType<typeof getAllPublishedGuides>> = [];
  try {
    guides = await getAllPublishedGuides();
  } catch (error) {
    console.error("[Sitemap] Failed to load published guides:", error);
  }

  const staticEntries = INDEXABLE_STATIC_PATHS.map((path) => ({
    loc: `${baseUrl}${path}`,
    lastmod: now,
  }));

  const sharedEntries = guides
    .filter((guide) => !!guide.guideId)
    .map((guide) => ({
      loc: `${baseUrl}/shared/${encodeURIComponent(guide.guideId)}`,
      lastmod: toIsoDate((guide as { updatedAt?: unknown }).updatedAt) ?? now,
    }));

  const allEntries = [...staticEntries, ...sharedEntries];
  const urlset = allEntries
    .map(
      ({ loc, lastmod }) =>
        `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`;
  return c.text(xml, 200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  });
});

// ========== AUTH ROUTES ==========
App.on(["POST", "GET"], "/api/auth/*", authRateLimiter, async (c) => {
  try {
    const auth = await getAuthInstance(c.env, c.req.raw);
    return auth.handler(c.req.raw);
  } catch (error) {
    console.error("[AuthRoute] Error:", error);
    return c.json({
      error: "auth_unavailable",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, 503);
  }
});

// ========== PUBLIC TRPC ROUTES (no auth, IP rate limited) ==========
for (const route of PUBLIC_TRPC_ROUTES) {
  App.all(route, publicRateLimiter, publicTrpcHandler);
}

// ========== SESSION-ONLY TRPC ROUTES (auth required, no access check) ==========
for (const route of SESSION_ONLY_ROUTES) {
  App.all(route, authMiddleware, authenticatedTrpcHandler);
}

// ========== PROTECTED TRPC ROUTES (full auth + access check) ==========
App.all("/trpc/*", authMiddleware, accessMiddleware, trpcRateLimiter, authenticatedTrpcHandler);
