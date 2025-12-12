import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/worker/trpc/router";

// Separate file to avoid circular imports
export const trpcClient = createTRPCClient<AppRouter>({
    links: [httpBatchLink({ url: "/trpc" })],
});
