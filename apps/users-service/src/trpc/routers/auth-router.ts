import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateToken, setCookieTokens, clearCookieTokens } from "@my-elk/auth";

import { router, publicProcedure, authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";

const logger = areaLogger("auth-router");

export default router({
    login: publicProcedure
        .input(z.object({ userId: z.number() }))
        .query(({ ctx: { userId, res }, input }) => {
        if (userId === null) {
            const [accessToken, atError] = generateToken({ userId: input.userId });
            const [refreshToken, rtError] = generateToken({ userId: input.userId }, 2);
            if (atError || rtError) throw new TRPCError({
                message: `Can not generate tokens: access: ${atError?.message || "ok"} | ${rtError?.message || "ok"}`,
                code: "INTERNAL_SERVER_ERROR",
            })
            setCookieTokens({ accessToken, refreshToken, res });
            return `new ${input.userId}`;
        }
        return `from context ${userId}`;
    }),
    logout: authedProcedure.query(({ ctx: { res } }) => {
        clearCookieTokens({ res });
        return "ok";
    }),
    check: authedProcedure.query(({ ctx }) => {
        return ctx.userId
    }),
})