import { orm } from "../mikroORM";
import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { Category } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { FilterQuery } from "@mikro-orm/core";

const logger = areaLogger("categories-service");

export default {
	create: async (body: Omit<Category, "id">): AsyncResultError<Category, ServiceError> => createEntity({
		Entity: Category,
		body,
		orm,
		logger,
	}),
	update: async (body: Category): AsyncResultError<Category, ServiceError> => updateEntity({
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
	getMany: async ({
		userId,
		filter,
		pagination,
		sorting,
	}: GetManyServiceParams<Category, { query?: string }>): AsyncResultError<{ data: Category[], total: number }, ServiceError> => {
		const { query } = filter || {};
		const where: FilterQuery<Category> = { userId };
		if (query) {
			where.name = { $ilike: `%${query}%` };
		}

		return getManyEntities({
			Entity: Category,
			where,
			pagination,
			sorting,
			orm,
			logger,
		})
	},
};
