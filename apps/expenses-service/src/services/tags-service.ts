import { orm } from "../mikroORM";
import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { TagDTO } from "../mikroORM/entityDTO";
import { Tag } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { FilterQuery, wrap } from "@mikro-orm/core";

const logger = areaLogger("tags-service");

export default {

	create: async (body: { name: string; userId: number }): AsyncResultError<TagDTO, ServiceError> => {
		const result = createEntity({
			Entity: Tag,
			body,
			orm,
			logger,
		})
		return result as AsyncResultError<TagDTO, ServiceError>;
	},
	update: async (body: {
		purchases: number[] | null;
		id: number;
		name: string;
		userId: number;
	}): AsyncResultError<TagDTO, ServiceError> => {
		const result = updateEntity({
			Entity: Tag,
			body,
			orm,
			logger,
		})
		return result as AsyncResultError<TagDTO, ServiceError>;
	},
	getOne: async (where: { id: number; userId: number }): AsyncResultError<TagDTO, ServiceError> => {
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
			return [wrap(tag).toObject() as unknown as TagDTO, null];
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
	}: GetManyServiceParams<TagDTO, { query?: string; id?: number | number[] }>): AsyncResultError<{ data: TagDTO[], total: number }, ServiceError> => {
		const { query, id } = filter || {};
		const where: FilterQuery<Tag> = { userId };

		if (query) {
			where.name = { $ilike: `%${query}%` };
		}
		if (id !== undefined) where.id = id;
		
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
