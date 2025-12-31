import { initTRPC } from "@trpc/server";

const trpcInstance = initTRPC.create();

export const router = trpcInstance.router;
export const publicProcedure = trpcInstance.procedure;
