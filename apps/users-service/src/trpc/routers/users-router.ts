import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, publicProcedure } from "../trpc";
import usersService from "../../services/users-service";
import { areaLogger } from "../../utils/logger";

const logger = areaLogger("users-router");

export default router({
    getById: publicProcedure
        .input(z.number())
        .query(async ({ input }) => {
            const [result, error] = await usersService
                .getBy({ id: input })
                .catch(e => {
                    logger.warn("getById => usersService.getBy", e);
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: e.message,
                    })
            });

            if (error) throw new TRPCError({
                code: error.code,
                message: error.error.message,
            });

            if (result) return result;
        }),
    getByEmail: publicProcedure
        .input(z.email())
        .query(async ({ input }) => {
            const [result, error] = await usersService
                .getBy({ email: input })
                .catch(e => {
                    logger.warn("getByEmail => usersService.getBy", e);
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: e.message,
                    })
            });

            if (error) throw new TRPCError({
                code: error.code,
                message: error.error.message,
            });

            if (result) return result;
        }),
    create: publicProcedure
        .input(z.object({ email: z.email(), password: z.string() }))
        .mutation(async ({ input }) => {
            const [result, error] = await usersService
                .create(input)
                .catch(e => {
                    logger.warn("create => usersService.create", e);
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: e.message,
                    })
            });

            if (error) throw new TRPCError({
                code: error.code,
                message: error.error.message,
            });

            if (result) return result;
        })
})