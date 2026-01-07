import { orm } from "../mikroORM";
import { createEntity } from "@my-elk/helpers";

import { Category } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

const logger = areaLogger("categories-service");

export default {
    create: async (input: { name: string; userId: number }): AsyncResultError<Category, ServiceError> => createEntity({
        Entity: Category,
        input,
        orm,
        logger,
    }),
    getAll: async (): AsyncResultError<Category[], ServiceError> => {
        try {
            const categories = await orm.em.fork().findAll(Category);
            return [categories, null];
        } catch (e) {
            logger.warn("[get All]", e);
            return [
                null,
                {
                    code: "INTERNAL_SERVER_ERROR",
                    error: e as Error,
                }
            ];
        }
    },
};
