import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers/dist/serviceHelpers";

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
            const result = await productsService.create({ ...input, userId: ctx.userId });
            return handleServiceError({
                result,
                methodName: "products.create",
                logger,
            });
        }),
    getMany: authedProcedure
        .query(async ({ ctx }) => {
            logger.debug("[getMany]", ctx.userId);
            if (!ctx.userId) throw notAuthedError;
            const result = await productsService.getMany({ userId: ctx.userId });
            return handleServiceError({
                result,
                methodName: "products.getMany",
                logger,
            });
        }),
    getOne: authedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            logger.debug("[getOne]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const result = await productsService.getOne({ ...input, userId: ctx.userId });
            return handleServiceError({
                result,
                methodName: "products.getOne",
                logger,
            });
        })
};
