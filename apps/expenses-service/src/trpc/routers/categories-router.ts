import { z } from "zod";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import categoriesService from "../../services/categories-service";
import { notAuthedError } from "./constants";
import { handleServiceError } from "@my-elk/helpers";

const logger = areaLogger("categories-router");

export default {
    create: authedProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input, ctx }) => {
            logger.debug("[create]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const result = await categoriesService.create({ name: input.name, userId: ctx.userId });
            return handleServiceError({
                result,
                methodName: "categories.create",
                logger,
            });
        }),
    getMany: authedProcedure
        .query(async ({ ctx }) => {
            logger.debug("[getMany]", ctx.userId);
            if (!ctx.userId) throw notAuthedError;
            const result = await categoriesService.getMany({ userId: ctx.userId });
            return handleServiceError({
                result,
                methodName: "categories.getMany",
                logger,
            })
        }),
    getOne: authedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            logger.debug("[getOne]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const result = await categoriesService.getOne({ id: input.id, userId: ctx.userId });
            return handleServiceError({
                result,
                methodName: "categories.getOne",
                logger,
            });
        })
};
