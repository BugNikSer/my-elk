import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import tagsService from "../../services/tags-service";
import { notAuthedError } from "./constants";

const logger = areaLogger("tags-router");

export default {
    create: authedProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input, ctx }) => {
            logger.debug("[create]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await tagsService.create({ name: input.name, userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "tags.create",
                logger,
            });
        }),
    getMany: authedProcedure
        .input(z.object({
            id: z.union([
                z.number(),
                z.array(z.number()),
            ]).optional(),
        }))
        .query(async ({ input, ctx }) => {
            logger.debug("[getMany]", ctx.userId);
            if (!ctx.userId) throw notAuthedError;
            const response = await tagsService.getMany({ ...input, userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "tags.getMany",
                logger,
            });
        }),
    getOne: authedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            logger.debug("[getOne]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await tagsService.getOne({ id: input.id, userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "tags.getOne",
                logger,
            });
        })
};
