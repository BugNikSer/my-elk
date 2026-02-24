import { FilterQuery, wrap } from "@mikro-orm/core";
import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { orm } from "../mikroORM";
import { Category, Kind, Product, Purchase, Tag } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";

const logger = areaLogger("purchases-service");

export default {
    create: async(rawBody: {
        userId: number;
        price: number;
        dateISO: string;
        productId: number;
        categoryId: number;
        kindId: number;
        tagIds: number[];
    }): AsyncResultError<Purchase, ServiceError> => {
        logger.debug("[create]", rawBody);

        const {
            dateISO,
            productId,
            categoryId,
            kindId,
            tagIds,
            ...restBody
        } = rawBody;

        const body: ConstructorParameters<typeof Purchase>[0] = {
            ...restBody,
            date: new Date(dateISO),
            product: orm.em.fork().getReference(Product, productId),
            category: orm.em.fork().getReference(Category, categoryId),
            kind: orm.em.fork().getReference(Kind, kindId),
            tags: tagIds.map(id => orm.em.fork().getReference(Tag, id)),
        };

        return createEntity({ Entity: Purchase, body, logger, orm, skipFirstLogging: true });
    },
    update: async (rawBody: {
        id: number;
        userId: number;
        price: number;
        productId: number;
        categoryId: number;
        kindId: number;
        tagIds: number[];
        dateISO: string;
    }): AsyncResultError<Purchase, ServiceError> => {
        logger.debug("[update]", rawBody);

        const {
            dateISO,
            productId,
            categoryId,
            kindId,
            tagIds,
            ...restBody
        } = rawBody;

        const body: ConstructorParameters<typeof Purchase>[0] & { id: number } = {
            ...restBody,
            date: new Date(dateISO),
            product: orm.em.getReference(Product, productId),
            category: orm.em.getReference(Category, categoryId),
            kind: orm.em.getReference(Kind, kindId),
            tags: tagIds.map(id => orm.em.getReference(Tag, id)),
        };

        const result = updateEntity({
            Entity: Purchase,
            body,
            orm,
            logger,
        })
        return result as AsyncResultError<Purchase, ServiceError>;
    },
    getOne: async (where: { id: number; userId: number }): AsyncResultError<Purchase, ServiceError> => {
        logger.debug("[getOne]", where);
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
    getMany: async ({
        userId,
        filter,
        pagination,
        sorting,
    }: GetManyServiceParams<Purchase, { query?: string; id?: number | number[] }>): AsyncResultError<{ data: Purchase[]; total: number }, ServiceError> => {
        const { query, id } = filter || {};
        const where: FilterQuery<Purchase> = { userId };

        if (query) {
            where.product = { name: { $ilike: `%${query}%` } };
        }
        if (id !== undefined) {
            where.id = Array.isArray(id) ? { $in: id } : id;
        }

        return getManyEntities({
            Entity: Purchase,
            where,
            pagination,
            sorting,
            orm,
            logger,
        });
    },
};
