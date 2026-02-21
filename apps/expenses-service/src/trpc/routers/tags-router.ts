import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { areaLogger } from "../../utils/logger";
import tagsService from "../../services/tags-service";
import { IterableEventEmitter, MyEvents, onEvent } from "../../utils/emitter";
import { Tag } from "../../mikroORM/entities";
import { authedProcedure } from "../trpc";
import { defaultGetManyInput, notAuthedError } from "./constants";

const logger = areaLogger("tags-router");
const emitter = new IterableEventEmitter<MyEvents<Tag>>();

const tagCreateInput = z.object({ name: z.string() });
const tagUpdateInput = tagCreateInput.extend({ id: z.number(), purchases: z.union([ z.array(z.number()), z.null() ]) });

export default {
	create: authedProcedure
		.input(tagCreateInput)
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
		.subscription(async function* (options) {
			yield* onEvent({ options, emitter, event: "created" })
		}),
	update: authedProcedure
		.input(tagUpdateInput)
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
		.subscription(async function* (options) {
			yield* onEvent({ options, emitter, event: "updated" })
		}),
	getMany: authedProcedure
		.input(defaultGetManyInput)
		.query(async ({ input, ctx }) => {
			logger.debug("[getMany]", ctx.userId, input);
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
