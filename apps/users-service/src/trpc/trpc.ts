import { initTRPC, TRPCError } from "@trpc/server";
import { TRPCContext } from "./context";

const trpcInstance = initTRPC.context<TRPCContext>().create();

export const router = trpcInstance.router;
export const publicProcedure = trpcInstance.procedure;
export const authedProcedure = trpcInstance.procedure.use(async function isAuthed(opts) {
    const { ctx } = opts;
    console.log(ctx);

    if (!ctx.accessToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authorized" });

    return opts.next({ ctx });
})
