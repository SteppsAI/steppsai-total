import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@user-app/worker/trpc/router';
import { TRPC_URL } from './config';

export const trpc = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: TRPC_URL,
            // Auth headers will be added here later
            // headers: async () => ({
            //     Authorization: `Bearer ${await getAuthToken()}`,
            // }),
        }),
    ],
});

