import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { authedProcedure, router } from "../trpc";
import { areaLogger } from "../../utils/logger";
import categoriesService from "../../services/categories-service";
import { defaultGetManyInput, notAuthedError } from "./constants";
import { IterableEventEmitter, MyEvents, onEvent } from '../../utils/emitter';
import { Category } from "../../mikroORM/entities";

const logger = areaLogger("categories-router");
const emitter = new IterableEventEmitter<MyEvents<Category>>();

export default router({
	create: authedProcedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input, ctx }) => {
			logger.debug("[create]", ctx.userId, input);
			if (!ctx.userId) throw notAuthedError;
			const response = await categoriesService.create({ name: input.name, userId: ctx.userId });
			const result = handleServiceError({
				response,
				methodName: "categories.create",
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
		.input(z.object({ id: z.number(), name: z.string() }))
		.mutation(async ({ input, ctx }) => {
			logger.debug("[update]", ctx.userId, input);
			if (!ctx.userId) throw notAuthedError;
			const response = await categoriesService.update({ ...input, userId: ctx.userId });
			const result = handleServiceError({
				response,
				methodName: "categories.update",
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
		.query(async ({ input, ctx }) => {
			logger.debug("[getMany]", ctx.userId, input);
			if (!ctx.userId) throw notAuthedError;
			const response = await categoriesService.getMany({
				userId: ctx.userId,
				...input,
			});
			return handleServiceError({
				response,
				methodName: "categories.getMany",
				logger,
			})
		}),
	getOne: authedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			logger.debug("[getOne]", ctx.userId, input);
			if (!ctx.userId) throw notAuthedError;
			const response = await categoriesService.getOne({ id: input.id, userId: ctx.userId });
			return handleServiceError({
				response,
				methodName: "categories.getOne",
				logger,
			});
		})
});
