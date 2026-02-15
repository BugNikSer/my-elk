import { orm } from "../mikroORM";
import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { Purchase, Tag } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { Collection } from "@mikro-orm/core";

const logger = areaLogger("tags-service");

export default {
	create: async (body: { name: string; userId: number }): AsyncResultError<Tag, ServiceError> => createEntity({
		Entity: Tag,
		body,
		orm,
		logger,
	}),
	update: async ({ purchaseIds, ...tagBody }: Omit<Tag, "purchases"> & { purchaseIds: number[] }): AsyncResultError<Tag, ServiceError> => {
		const body: Tag = { ...tagBody, purchases: new Collection<Purchase>(purchaseIds) };
		return updateEntity({
			Entity: Tag,
			body,
			orm,
			logger,
		})
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
			return [tag, null];
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
	}: GetManyServiceParams<Tag, { query?: string }>): AsyncResultError<{ data: Tag[], total: number }, ServiceError> => {
		const where = { userId, ...filter };
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
