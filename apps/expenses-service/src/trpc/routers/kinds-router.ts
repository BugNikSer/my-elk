import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import kindsService from "../../services/kinds-service";
import { notAuthedError } from "./constants";

const logger = areaLogger("kinds-router");

export default {
    create: authedProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input, ctx }) => {
            logger.debug("[create]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await kindsService.create({ name: input.name, userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "kinds.create",
                logger,
            });
        }),
    getMany: authedProcedure
        .query(async ({ ctx }) => {
            logger.debug("[getMany]", ctx.userId);
            if (!ctx.userId) throw notAuthedError;
            const response = await kindsService.getMany({ userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "kinds.getMany",
                logger,
            });
        }),
    getOne: authedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            logger.debug("[getOne]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await kindsService.getOne({ id: input.id, userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "kinds.getOne",
                logger,
            });
        })
};
