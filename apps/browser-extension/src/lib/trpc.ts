import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@user-app/worker/trpc/router';
import { TRPC_URL } from './config';

export const trpc = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: TRPC_URL,
            // Important: extension is cross-origin, so we must include cookies
            fetch: (input: any, init: any) => fetch(input, { ...init, credentials: 'include' }),
        }),
    ],
});

