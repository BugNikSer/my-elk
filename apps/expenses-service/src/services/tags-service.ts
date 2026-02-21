import { orm } from "../mikroORM";
import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { Tag } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { FilterQuery, wrap } from "@mikro-orm/core";

const logger = areaLogger("tags-service");

export default {

	create: async (body: { name: string; userId: number }): AsyncResultError<Tag, ServiceError> => {
		return createEntity({
			Entity: Tag,
			body,
			orm,
			logger,
		})
	},
	update: async (body: {
		id: number;
		name: string;
		userId: number;
		purchases: number[] | null;
	}): AsyncResultError<Tag, ServiceError> => {
		const result = updateEntity({
			Entity: Tag,
			body,
			orm,
			logger,
		})
		return result as AsyncResultError<Tag, ServiceError>;
	},
	getOne: async (where: { id: number; userId: number }): AsyncResultError<Tag, ServiceError> => {
		logger.debug("[getOne]", where);
		try {
			const tag = await orm.em.fork().findOne(Tag, where);
			if (!tag) return [
				null,
				{
					code: "NOT_FOUND",
					error: new Error("tag not found"),
				},
			];
			return [wrap(tag).toObject() as unknown as Tag, null];
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
	}: GetManyServiceParams<Tag, { query?: string; id?: number | number[] }>): AsyncResultError<{ data: Tag[], total: number }, ServiceError> => {
		const { query, id } = filter || {};
		const where: FilterQuery<Tag> = { userId };

		if (query) {
			where.name = { $ilike: `%${query}%` };
		}
		if (id !== undefined) {
            where.id = Array.isArray(id) ? { $in: id } : id;
        }
		
		return getManyEntities({
			Entity: Tag,
			where,
			pagination,
			sorting,
			orm,
			logger,
		})
	},
};
