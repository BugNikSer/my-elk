import { wrap } from "@mikro-orm/core";
import { createEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { orm } from "../mikroORM";
import { Category, Kind, Product, Purchase, Tag } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";

const logger = areaLogger("purchases-service");

export default {
    create: async(rawBody: {
        userId: number;
        productId: number;
        categoryId: number;
        kindId: number;
        tagIds: number[];
    }): AsyncResultError<Purchase, ServiceError> => {
        logger.debug("[create]", rawBody);

        const {
            userId,
            productId,
            categoryId,
            kindId,
            tagIds,
        } = rawBody;

        const body: ConstructorParameters<typeof Purchase>[0] = {
            userId,
            product: orm.em.getReference(Product, productId),
            category: orm.em.getReference(Category, categoryId),
            kind: orm.em.getReference(Kind, kindId),
            tags: tagIds.map(id => orm.em.getReference(Tag, id)),
        };

        return createEntity({ Entity: Purchase, body, logger, orm, skipFirstLogging: true });
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
            return [wrap(purchase).toObject() as unknown as Purchase, null];
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
            return [purchase.map((p) => wrap(p).toObject() as unknown as Purchase), null];
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
