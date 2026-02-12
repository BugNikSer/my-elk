import { orm } from "../mikroORM";
import { createEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { Category } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";

const logger = areaLogger("categories-service");

export default {
    create: async (body: { name: string; userId: number }): AsyncResultError<Category, ServiceError> => createEntity({
        Entity: Category,
        body,
        orm,
        logger,
    }),
    getOne: async (where: { id: number; userId: number }): AsyncResultError<Category, ServiceError> => {
        logger.debug("[getOne]", where);
        try {
            const category = await orm.em.fork().findOne(Category, where);
            if (!category) return [
                null,
                {
                    code: "NOT_FOUND",
                    error: new Error("Category not found"),
                },
            ];
            return [category, null];
        } catch (e) {
            logger.warn("[getOne]", e);
            return [
                null,
                {
                    code: "INTERNAL_SERVER_ERROR",
                    error: e as Error,
                },
            ];
        }
    },
    getMany: async (where: { userId: number }): AsyncResultError<Category[], ServiceError> => {
        logger.debug("[getMany]", where);
        try {
            const categories = await orm.em.fork().find(Category, where);
            return [categories, null];
        } catch (e) {
            logger.warn("[getMany]", e);
            return [
                null,
                {
                    code: "INTERNAL_SERVER_ERROR",
                    error: e as Error,
                },
            ];
        }
    },
};
