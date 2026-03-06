import { FilterQuery, Populate, wrap } from "@mikro-orm/core";
import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { orm } from "../mikroORM";
import { Category, Kind, Product, Purchase, Tag } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { PurchaseConstructorParams } from "../mikroORM/types";

const logger = areaLogger("purchases-service");
const populate = ["product", "category", "kind", "tags"] as unknown as Populate<Purchase>;

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

        const body = { ...rawBody, date: new Date(rawBody.dateISO) } as unknown as PurchaseConstructorParams;

        return createEntity({
            Entity: Purchase,
            body,
            populate,
            logger,
            orm,
            skipFirstLogging: true,
        });
    },
    update: async (body: {
        id: number;
        userId: number;
        price: number;
        productId: number;
        categoryId: number;
        kindId: number;
        tagIds: number[];
        dateISO: string;
    }): AsyncResultError<Purchase, ServiceError> => {
        logger.debug("[update] input", body);

        const result = await updateEntity({
			Entity: Purchase,
			body,
			populate,
			orm,
			logger,
			skipFirstLogging: true,
		});
		return result
    },
    getOne: async (where: { id: number; userId: number }): AsyncResultError<Purchase, ServiceError> => {
        logger.debug("[getOne]", where);
        try {
            const purchase = await orm.em.fork().findOne(Purchase, where, { populate });
            
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
            populate,
            orm,
            logger,
        });
    },
};
