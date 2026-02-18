import { z } from "zod";
import { tracked } from "@trpc/server";
import { handleServiceError } from "@my-elk/helpers";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import productsService from "../../services/products-service";
import { notAuthedError } from "./constants";
import { IterableEventEmitter, MyEvents } from "../../utils/emitter";
import { Product } from "../../mikroORM/entities";

const logger = areaLogger("products-router");
const emitter = new IterableEventEmitter<MyEvents<Product>>();

export default {
    create: authedProcedure
        .input(z.object({
            name: z.string(),
            defaultCategory: z.number().optional(),
            defaultKind: z.number().optional(),
        }))
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
		.subscription(async function* ({ ctx, signal }) {
			const iterable = emitter.toIterable("created", { signal });

			function* maybeYield(kind: Product) {
				if (kind.userId !== ctx.userId) return;
				yield tracked(String(kind.id), kind);
			}

			for await (const [kind] of iterable) {
				yield* maybeYield(kind);
			}
		}),
	update: authedProcedure
		.input(z.object({
            id: z.number(),
            name: z.string(),
            defaultCategory: z.number().optional(),
            defaultKind: z.number().optional(),
        }))
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
		.subscription(async function* ({ ctx, signal }) {
			const iterable = emitter.toIterable("updated", { signal });

			function* maybeYield(category: Product) {
				if (category.userId !== ctx.userId) return;
				yield tracked(String(category.id), category);
			}

			for await (const [category] of iterable) {
				yield* maybeYield(category);
			}
		}),
    getMany: authedProcedure
		.input(z.object({
			filter: z.object({
				query: z.string().optional(),
				id: z.union([ z.number(), z.array(z.number()) ]).optional(),
			}).optional(),
			pagination: z.object({ page: z.number(), pageSize: z.number() }).optional(),
			sorting: z.object({ field: z.enum(["id", "name"]), order: z.enum(["ASC", "DESC"]) }).optional(),
		}))
        .query(async ({ ctx, input }) => {
            logger.debug("[getMany]", ctx.userId);
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
