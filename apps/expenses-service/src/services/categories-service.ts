import { orm } from "../mikroORM";
import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { Category } from "../mikroORM/entities";
import { CategoryDTO } from "../mikroORM/entityDTO";
import { areaLogger } from "../utils/logger";
import { FilterQuery } from "@mikro-orm/core";

const logger = areaLogger("categories-service");

export default {
	create: async (body: Omit<CategoryDTO, "id">): AsyncResultError<CategoryDTO, ServiceError> => {
		const result = createEntity({
			Entity: Category,
			body,
			orm,
			logger,
		});
		return result as AsyncResultError<CategoryDTO, ServiceError>;
	},
	update: async (body: CategoryDTO): AsyncResultError<CategoryDTO, ServiceError> => {
		const result = updateEntity({
			Entity: Category,
			body,
			orm,
			logger,
		});
		return result as AsyncResultError<CategoryDTO, ServiceError>;
	},
	getOne: async (where: { id: number; userId: number }): AsyncResultError<CategoryDTO, ServiceError> => {
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
	}: GetManyServiceParams<CategoryDTO, {
		query?: string,
		id?: number | number[],
	}>): AsyncResultError<{ data: CategoryDTO[], total: number }, ServiceError> => {
		const { query, id } = filter || {};
		const where: FilterQuery<Category> = { userId };

		if (query) {
			where.name = { $ilike: `%${query}%` };
		}
		if (id !== undefined) where.id = id;

		const result = getManyEntities({
			Entity: Category,
			where,
			pagination,
			sorting,
			orm,
			logger,
		});

		return result as AsyncResultError<{ data: CategoryDTO[], total: number }, ServiceError>;
	},
};
