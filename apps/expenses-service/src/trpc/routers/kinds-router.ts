import { z } from "zod";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import kindsService from "../../services/kinds-service";
import { notAuthedError } from "./constants";

const logger = areaLogger("kinds-router");

export default {
    create: authedProcedure
        .input(z.object({ name: z.string() }))
        .mutation(({ input, ctx }) => {
            logger.debug("[create]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            return kindsService.create({ name: input.name, userId: ctx.userId });
        }),
    getUsers: authedProcedure
        .query(async ({ ctx }) => {
            logger.debug("[getAll]", ctx.userId);
            if (!ctx.userId) throw notAuthedError;
            return kindsService.getUsers({ userId: ctx.userId });
        }),
    getOne: authedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            logger.debug("[getOne]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            return kindsService.getOne({ id: input.id, userId: ctx.userId });
        })
};
