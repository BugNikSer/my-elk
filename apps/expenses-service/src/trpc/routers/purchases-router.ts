import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import purchasesService from "../../services/purchases-service";
import { defaultGetManyInput, notAuthedError } from "./constants";
import { IterableEventEmitter, MyEvents, onEvent } from "../../utils/emitter";
import { Purchase } from "../../mikroORM/entities";

const logger = areaLogger("purchases-router");
const emitter = new IterableEventEmitter<MyEvents<Purchase>>();

const purchaseUpdateInput = z.object({
    userId: z.number(),
    productId: z.number(),
    categoryId: z.number(),
    kindId: z.number(),
    tagIds: z.array(z.number()),
});
const purchaseCreateInput = purchaseUpdateInput.extend({ id: z.number() })

export default {
    create: authedProcedure
        .input(purchaseUpdateInput)
        .mutation(async ({ input, ctx }) => {
            logger.debug("[create]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await purchasesService.create({ ...input, userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "purchases.create",
                logger,
            });
        }),
    onCreate: authedProcedure
        .subscription(async function* (options) {
            yield* onEvent({ options, emitter, event: "created" })
        }),
    update: authedProcedure
        .input(purchaseCreateInput)
        .mutation(async ({ input, ctx }) => {
            logger.debug("[update]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await purchasesService.update({ ...input, userId: ctx.userId });
            const result = handleServiceError({
                response,
                methodName: "purchases.update",
                logger,
            });
            emitter.emit("updated", result);
            return result;
        }),
    onUpdate: authedProcedure
        .subscription(async function* (options) {
            yield* onEvent({ options, emitter, event: "updated" })
        }),
    getMany: authedProcedure
        .input(defaultGetManyInput)
        .query(async ({ ctx }) => {
            logger.debug("[getMany]", ctx.userId);
            if (!ctx.userId) throw notAuthedError;
            const response = await purchasesService.getMany({ userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "purchases.getMany",
                logger,
            });
        }),
    getOne: authedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            logger.debug("[getOne]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await purchasesService.getOne({ id: input.id, userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "purchases.getOne",
                logger,
            });
        })
};
