import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpLink, TRPCClientError } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter as UsersAppRouter } from "@my-elk/users-service";
import type { AppRouter as ExpensesAppRouter } from "@my-elk/expenses-service";

const { VITE_USERS_SERVICE, VITE_EXPENSES_SERVICE } = import.meta.env;

export const queryClient = new QueryClient();

export const usersTrpcClient = createTRPCClient<UsersAppRouter>({
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
});
export const usersTrpc = createTRPCOptionsProxy<UsersAppRouter>({
    queryClient,
    client: usersTrpcClient,
});

export const expensesTrpcClient = createTRPCClient<ExpensesAppRouter>({
    links: [
        httpLink({
            url: `${VITE_EXPENSES_SERVICE}/expenses-trpc`,
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: 'include',
                });
            },
        })
    ]
});
export const expensesTRPC = createTRPCOptionsProxy<ExpensesAppRouter>({
    queryClient,
    client: expensesTrpcClient,
})

export const parseTRPCError = (error: TRPCClientError<UsersAppRouter | ExpensesAppRouter>) => {
    console.warn("[TRPC Error]", error);
    return [error.message, error.data?.code].filter(Boolean).join(": ");
}
