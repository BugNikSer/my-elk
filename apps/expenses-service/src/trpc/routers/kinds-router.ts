import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { areaLogger } from "../../utils/logger";
import kindsService from "../../services/kinds-service";
import { IterableEventEmitter, MyEvents, onEvent } from "../../utils/emitter";
import { Kind } from "../../mikroORM/entities";
import { authedProcedure } from "../trpc";
import { defaultGetManyInput, notAuthedError } from "./constants";

const logger = areaLogger("kinds-router");
const emitter = new IterableEventEmitter<MyEvents<Kind>>();

export default {
	create: authedProcedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input, ctx }) => {
			logger.debug("[create]", ctx.userId, input);
			if (!ctx.userId) throw notAuthedError;
			const response = await kindsService.create({ name: input.name, userId: ctx.userId });
			const result = handleServiceError({
				response,
				methodName: "kinds.create",
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
			const response = await kindsService.update({ ...input, userId: ctx.userId });
			const result = handleServiceError({
				response,
				methodName: "kinds.update",
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
			const response = await kindsService.getMany({
				userId: ctx.userId,
				...input,
			});
			return handleServiceError({
				response,
				methodName: "kinds.getMany",
				logger,
			});
		}),
	getOne: authedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			logger.debug("[getOne]", ctx.userId, input);
			if (!ctx.userId) throw notAuthedError;
			const response = await kindsService.getOne({ id: input.id, userId: ctx.userId });
			return handleServiceError({
				response,
				methodName: "kinds.getOne",
				logger,
			});
		})
};
