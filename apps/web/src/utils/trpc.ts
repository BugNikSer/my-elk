import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter } from "@my-elk/users-service";

const { VITE_USERS_SERVICE } = import.meta.env;

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpLink({
            url: `${VITE_USERS_SERVICE}/users-trpc`,
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: 'include',
                });
            },
        })
    ]
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
    queryClient,
    client: trpcClient,
});
