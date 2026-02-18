import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { areaLogger } from "../../utils/logger";
import tagsService from "../../services/tags-service";
import { IterableEventEmitter, MyEvents } from "../../utils/emitter";
import { Tag } from "../../mikroORM/entities";
import { authedProcedure } from "../trpc";
import { notAuthedError } from "./constants";
import { tracked } from "@trpc/server";

const logger = areaLogger("tags-router");
const emitter = new IterableEventEmitter<MyEvents<Tag>>();

export default {
	create: authedProcedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input, ctx }) => {
			logger.debug("[create]", ctx.userId, input);
			if (!ctx.userId) throw notAuthedError;
			const response = await tagsService.create({ name: input.name, userId: ctx.userId });
			const result = handleServiceError({
				response,
				methodName: "tags.create",
				logger,
			});
			emitter.emit("created", result);
			return result;
		}),
	onCreate: authedProcedure
		.subscription(async function* ({ ctx, signal }) {
			const iterable = emitter.toIterable("created", { signal });

			function* maybeYield(kind: Tag) {
				if (kind.userId !== ctx.userId) return;
				yield tracked(String(kind.id), kind);
			}

			for await (const [kind] of iterable) {
				yield* maybeYield(kind);
			}
		}),
	update: authedProcedure
		.input(z.object({ id: z.number(), name: z.string(), purchases: z.array(z.number()) }))
		.mutation(async ({ input, ctx }) => {
			logger.debug("[update]", ctx.userId, input);
			if (!ctx.userId) throw notAuthedError;
			const response = await tagsService.update({ ...input, userId: ctx.userId });
			const result = handleServiceError({
				response,
				methodName: "tags.update",
				logger,
			});
			emitter.emit("updated", result);
			return result;
		}),
	onUpdate: authedProcedure
		.subscription(async function* ({ ctx, signal }) {
			const iterable = emitter.toIterable("updated", { signal });

			function* maybeYield(category: Tag) {
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
