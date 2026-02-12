import { type TRPC_ERROR_CODE_KEY } from "@trpc/server";
import { createEntity, preloadLinkedEntities } from "@my-elk/helpers";
import { AsyncResultError, ResultError, ServiceError } from "@my-elk/result-error";

import { orm } from "../mikroORM";
import { Purchase } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import categoriesService from "./categories-service";
import kindsService from "./kinds-service";
import tagsService from "./tags-service";
import productsService from "./products-service";

const logger = areaLogger("purchases-service");

export default {
    create: async(body: {
        userId: number;
        productId: number;
        categoryId: number;
        kindId: number;
        tagIds: number[];
    }): AsyncResultError<Purchase, ServiceError> => {
        logger.debug("[create]", body);

        const {
            userId,
            productId,
            categoryId,
            kindId,
            tagIds,
        } = body;
        const processedBody = { userId } as ConstructorParameters<typeof Purchase>[0];

        const preloadError = await preloadLinkedEntities({
            body: processedBody,
            userId,
            config: [
                { service: categoriesService, field: "category", id: categoryId } as const,
                { service: kindsService, field: "kind", id: kindId } as const,
                { service: tagsService, field: "tags", id: tagIds } as const,
                { service: productsService, field: "product", id: productId } as const,
            ]
        });
        if (preloadError) return [null, preloadError];

        return createEntity({ Entity: Purchase, body: processedBody, logger, orm, skipFirstLogging: true });
    },
    getOne: async (where: { id: number; userId: number }): AsyncResultError<Purchase, ServiceError> => {
        logger.debug("[getMany]", where);
        try {
            const purchase = await orm.em.fork().findOne(Purchase, where);
            if (!purchase) return [
                null,
                {
                    code: "NOT_FOUND",
                    error: new Error("purchase not found"),
                },
            ];
            return [purchase, null];
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
    getMany: async(where: { userId: number }): AsyncResultError<Purchase[], ServiceError> => {
        logger.debug("[getMany]", where);
        try {
            const purchase = await orm.em.fork().find(Purchase, where);
            return [purchase, null];
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
