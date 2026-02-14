import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import productsService from "../../services/products-service";
import { notAuthedError } from "./constants";

const logger = areaLogger("products-router");

export default {
    create: authedProcedure
        .input(z.object({
            name: z.string(),
            defaultCategoryId: z.number().optional(),
            defaultKindId: z.number().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            logger.debug("[create]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await productsService.create({ ...input, userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "products.create",
                logger,
            });
        }),
    getMany: authedProcedure
        .query(async ({ ctx }) => {
            logger.debug("[getMany]", ctx.userId);
            if (!ctx.userId) throw notAuthedError;
            const response = await productsService.getMany({ userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "products.getMany",
                logger,
            });
        }),
    getOne: authedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            logger.debug("[getOne]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await productsService.getOne({ ...input, userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "products.getOne",
                logger,
            });
        })
};
