import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { orm } from "../mikroORM";
import { Category, Kind, Product } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { FilterQuery, Populate, wrap } from "@mikro-orm/core";
import { ProductConstructorParams } from "../mikroORM/types";

const logger = areaLogger("products-service");
const populate = ["defaultCategory", "defaultKind"] as unknown as Populate<Product>

export default {
	create: async (body: {
		name: string;
		userId: number;
		defaultCategoryId?: number;
		defaultKindId?: number;
	}): AsyncResultError<Product, ServiceError> => {
		logger.debug("[create]", body);

		return createEntity({
			Entity: Product,
			body,
			orm,
			populate,
			logger,
			skipFirstLogging: true,
		});
	},
	update: async (body: {
		name: string;
		userId: number;
		defaultCategoryId?: number;
		defaultKindId?: number;
		id: number;
	}): AsyncResultError<Product, ServiceError> => {
		logger.debug("[update]", body);

		return updateEntity({
			Entity: Product,
			body,
			populate,
			orm,
			logger,
			skipFirstLogging: true,
		});
	},
	getOne: async (where: { id: number, userId: number }): AsyncResultError<Product, ServiceError> => {
		logger.debug("[getOne]", where);
		try {
			const product = await orm.em.fork().findOne(Product, where, { populate });
			if (!product) return [
				null,
				{
					code: "NOT_FOUND",
					error: new Error("product not found"),
				},
			];
			return [wrap(product).toObject() as unknown as Product, null];
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
	}: GetManyServiceParams<Product, { query?: string; id?: number | number[] }>): AsyncResultError<{ data: Product[], total: number }, ServiceError> => {
		const { query, id } = filter || {};
		const where: FilterQuery<Product> = { userId };

		if (query) {
			where.name = { $ilike: `%${query}%` };
		}
		if (id !== undefined) {
            where.id = Array.isArray(id) ? { $in: id } : id;
        }
		
		return getManyEntities({
			Entity: Product,
			where,
			pagination,
			sorting,
			orm,
			logger,
			populate,
		})
	},
};
