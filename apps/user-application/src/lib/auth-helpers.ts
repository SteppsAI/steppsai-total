import { authClient } from "@/components/auth/client";

// ============ SESSION CACHE ============
let sessionCache: { data: any; timestamp: number } | null = null;
const SESSION_CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function getSessionCached() {
  const now = Date.now();
  if (sessionCache && now - sessionCache.timestamp < SESSION_CACHE_TTL) {
    return sessionCache.data;
  }
  const session = await authClient.getSession();
  sessionCache = { data: session, timestamp: now };
  return session;
}

export function clearSessionCache() {
  sessionCache = null;
}

// ============ ACCESS CACHE ============
let accessCache: { hasAccess: boolean; timestamp: number } | null = null;
const ACCESS_CACHE_TTL = 1000 * 60 * 2; // 2 minutes

export async function getAccessCached(): Promise<boolean> {
  const now = Date.now();
  if (accessCache && now - accessCache.timestamp < ACCESS_CACHE_TTL) {
    return accessCache.hasAccess;
  }

  try {
    // Use BetterAuth's creem plugin endpoint
    const result = await authClient.creem.hasAccessGranted();
    const hasAccess = (result as any)?.data?.hasAccess ?? false;
    accessCache = { hasAccess, timestamp: now };
    return hasAccess;
  } catch (error) {
    console.error("[AuthHelpers] Access check failed:", error);
    return false;
  }
}

export function clearAccessCache() {
  accessCache = null;
}

// ============ CLEAR ALL ============
export function clearAllAuthCaches() {
  clearSessionCache();
  clearAccessCache();
}
