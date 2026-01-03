import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter } from "@my-elk/users-service";

const { VITE_USERS_SERVICE_HOST, VITE_USERS_SERVICE_PORT } = import.meta.env;

export const queryClient = new QueryClient();

let usersServiceUrl = `${VITE_USERS_SERVICE_HOST}:${VITE_USERS_SERVICE_PORT}/trpc`;
if (!usersServiceUrl.startsWith("http://")) usersServiceUrl = `http://${usersServiceUrl}`;

export const trpc = createTRPCOptionsProxy<AppRouter>({
    queryClient,
    client: createTRPCClient<AppRouter>({
        links:[httpBatchLink({ url: usersServiceUrl })]
    })
})
