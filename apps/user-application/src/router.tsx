import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { routeTree } from "./routeTree.gen";
import type { AppRouter } from "@/worker/trpc/router";
import Pending from "@/components/common/pending";
import { ErrorComponent } from "@/components/common/error-boundary";
import { trpcClient } from "@/lib/trpc-client";

// Re-export for convenience
export {
  getSessionCached,
  getAccessCached,
  clearSessionCache,
  clearAccessCache,
  clearAllAuthCaches,
} from "@/lib/auth-helpers";

// Re-export trpcClient
export { trpcClient };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    context: { trpc, queryClient },
    defaultPendingComponent: () => <Pending />,
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
