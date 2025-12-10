import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { routeTree } from "./routeTree.gen";
import type { AppRouter } from "@/worker/trpc/router";
import Pending from "@/components/common/pending";
import { ErrorComponent } from "@/components/common/error-boundary";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { authClient } from "@/components/auth/client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchOnMount: true, // Refetch when component mounts (including window reload)
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

// Session cache
let sessionCache: { data: any; timestamp: number } | null = null;
const SESSION_CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function getSessionCached() {
  const now = Date.now();

  if (sessionCache && (now - sessionCache.timestamp) < SESSION_CACHE_TTL) {
    return sessionCache.data;
  }

  const session = await authClient.getSession();
  sessionCache = { data: session, timestamp: now };
  return session;
}

export function clearSessionCache() {
  sessionCache = null;
}

// Access status cache
let accessCache: { data: any; timestamp: number } | null = null;
const ACCESS_CACHE_TTL = 1000 * 60 * 2; // 2 minutes

export async function getAccessStatusCached() {
  const now = Date.now();

  if (accessCache && (now - accessCache.timestamp) < ACCESS_CACHE_TTL) {
    return accessCache.data;
  }

  const accessStatus = await authClient.creem.hasAccessGranted();
  accessCache = { data: accessStatus, timestamp: now };
  return accessStatus;
}

export function clearAccessCache() {
  accessCache = null;
}

export function clearAllCaches() {
  clearSessionCache();
  clearAccessCache();
}

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    context: {
      trpc,
      queryClient,
    },
    defaultPendingComponent: () => <Pending />,
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    Wrap: function WrapComponent({ children }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    },
  });

  return router;
}

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
