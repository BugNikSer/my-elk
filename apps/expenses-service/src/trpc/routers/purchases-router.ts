import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import purchasesService from "../../services/purchases-service";
import { defaultGetManyFilter, defaultGetManyPagination, defaultGetManySorting, notAuthedError } from "./constants";
import { IterableEventEmitter, MyEvents, onEvent } from "../../utils/emitter";
import { Purchase } from "../../mikroORM/entities";

const logger = areaLogger("purchases-router");
const emitter = new IterableEventEmitter<MyEvents<Purchase>>();

const purchaseCreateInput= z.object({
    price: z.number(),
    productId: z.number(),
    categoryId: z.number(),
    kindId: z.number(),
    tagIds: z.array(z.number()),
    dateISO: z.string(),
});
const purchaseUpdateInput = purchaseCreateInput.extend({ id: z.number() });

const purchasesGetManyInput = z.object({
    filter: defaultGetManyFilter,
    pagination: defaultGetManyPagination,
    sorting: z.object({ field: z.enum(["id", "date"]), order: z.enum(["ASC", "DESC"]) }).optional(),
});

export default {
    create: authedProcedure
        .input(purchaseCreateInput)
        .mutation(async ({ input, ctx }) => {
            logger.debug("[create]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await purchasesService.create({ ...input, userId: ctx.userId });

            const result = handleServiceError({
                response,
                methodName: "purchases.create",
                logger,
            });
            emitter.emit("created", result);
            return result;
        }),
    onCreate: authedProcedure
        .subscription(async function* (options) {
            yield* onEvent({ options, emitter, event: "created" })
        }),
    update: authedProcedure
        .input(purchaseUpdateInput)
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
        .input(purchasesGetManyInput)
        .query(async ({ ctx, input }) => {
            logger.debug("[getMany]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await purchasesService.getMany({
                userId: ctx.userId,
                ...input,
            });
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
