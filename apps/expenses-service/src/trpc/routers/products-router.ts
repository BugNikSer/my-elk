import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import productsService from "../../services/products-service";
import { defaultGetManyInput, notAuthedError } from "./constants";
import { IterableEventEmitter, MyEvents, onEvent } from "../../utils/emitter";
import { Product } from "../../mikroORM/entities";

const logger = areaLogger("products-router");
const emitter = new IterableEventEmitter<MyEvents<Product>>();

const productCreateInput = z.object({
    name: z.string(),
    defaultCategory: z.number().optional(),
    defaultKind: z.number().optional(),
});
const productUpdateInput = productCreateInput.extend({ id: z.number() });

export default {
    create: authedProcedure
        .input(productCreateInput)
        .mutation(async ({ input, ctx }) => {
            logger.debug("[create]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await productsService.create({ ...input, userId: ctx.userId });
            const result = handleServiceError({
                response,
                methodName: "products.create",
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
		.input(productUpdateInput)
		.mutation(async ({ input, ctx }) => {
			logger.debug("[update]", ctx.userId, input);
			if (!ctx.userId) throw notAuthedError;
			const response = await productsService.update({ ...input, userId: ctx.userId });
			const result = handleServiceError({
				response,
				methodName: "products.update",
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
        .query(async ({ ctx, input }) => {
            logger.debug("[getMany]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await productsService.getMany({ ...input, userId: ctx.userId });
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
