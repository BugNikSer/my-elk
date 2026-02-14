import EventEmitter from "events";
import { z } from "zod";
import { handleServiceError } from "@my-elk/helpers";
import { tracked } from "@trpc/server";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import categoriesService from "../../services/categories-service";
import { notAuthedError } from "./constants";
import { IterableEventEmitter, MyEvents } from '../../utils/emitter';
import { Category } from '../..';

const logger = areaLogger("categories-router");
const emitter = new IterableEventEmitter<MyEvents<Category>>();

export default {
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
        .subscription(async function* ({ ctx, input, signal }) {
            const iterable = emitter.toIterable("created", { signal });

            function* maybeYield(category: Category) {
                if (category.userId === ctx.userId) {
                    yield tracked(String(category.id), category);
                }
            }

            for await (const [category] of iterable) {
                yield maybeYield(category);
            }
        }),
    update: authedProcedure
        .input(z.object({ id: z.number(), name: z.string() }))
        .mutation(async ({ input, ctx }) => {
            logger.debug("[update]", ctx.userId, input);
            if (!ctx.userId) throw notAuthedError;
            const response = await categoriesService.update({ ...input, userId: ctx.userId });
            return handleServiceError({
                response,
                methodName: "categories.update",
                logger,
            });
        }),
    getMany: authedProcedure
        .input(z.object({
            filter: z.object({  }).optional(),
            pagination: z.object({ page: z.number(), pageSize: z.number() }).optional(),
            sorting: z.object({ field: z.enum(["id", "name"]), order: z.enum(["ASC", "DESC"]) }).optional(),
        }))
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
};
