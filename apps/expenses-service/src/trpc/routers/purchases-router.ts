import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers/dist/serviceHelpers";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import purchasesService from "../../services/purchases-service";
import { notAuthedError } from "./constants";

const logger = areaLogger("purchases-router");

export default {
    create: authedProcedure
        .input(z.object({
            userId: z.number(),
            productId: z.number(),
            categoryId: z.number(),
            kindId: z.number(),
            tagIds: z.array(z.number()),
        }))
        .mutation(async ({ input, ctx }) => {
            logger.debug("[create]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const result = await purchasesService.create({ ...input, userId: ctx.userId });
            return handleServiceError({
                result,
                methodName: "purchases.create",
                logger,
            });
        }),
    getMany: authedProcedure
        .query(async ({ ctx }) => {
            logger.debug("[getMany]", ctx.userId);
            if (!ctx.userId) throw notAuthedError;
            const result = await purchasesService.getMany({ userId: ctx.userId });
            return handleServiceError({
                result,
                methodName: "purchases.getMany",
                logger,
            });
        }),
    getOne: authedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            logger.debug("[getOne]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const result = await purchasesService.getOne({ id: input.id, userId: ctx.userId });
            return handleServiceError({
                result,
                methodName: "purchases.getOne",
                logger,
            });
        })
};
