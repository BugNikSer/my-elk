import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";

import { areaLogger } from "../../utils/logger";
import kindsService from "../../services/kinds-service";
import { IterableEventEmitter, MyEvents } from "../../utils/emitter";
import { Kind } from "../../mikroORM/entities";
import { authedProcedure } from "../trpc";
import { notAuthedError } from "./constants";
import { tracked } from "@trpc/server";

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
		.subscription(async function* ({ ctx, signal }) {
			const iterable = emitter.toIterable("created", { signal });

			function* maybeYield(kind: Kind) {
				if (kind.userId !== ctx.userId) return;
				yield tracked(String(kind.id), kind);
			}

			for await (const [kind] of iterable) {
				yield* maybeYield(kind);
			}
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
		.subscription(async function* ({ ctx, signal }) {
			const iterable = emitter.toIterable("updated", { signal });

			function* maybeYield(kind: Kind) {
				if (kind.userId !== ctx.userId) return;
				yield tracked(String(kind.id), kind);
			}

			for await (const [kind] of iterable) {
				yield* maybeYield(kind);
			}
		}),
	getMany: authedProcedure
		.input(z.object({
			filter: z.object({ query: z.string().optional() }).optional(),
			pagination: z.object({ page: z.number(), pageSize: z.number() }).optional(),
			sorting: z.object({ field: z.enum(["id", "name"]), order: z.enum(["ASC", "DESC"]) }).optional(),
		}))
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
