import { orm } from "../mikroORM";
import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { Kind } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { get } from "node:http";
import { FilterQuery } from "@mikro-orm/core";

const logger = areaLogger("kinds-service");

export default {
	create: async (body: { name: string; userId: number }): AsyncResultError<Kind, ServiceError> => createEntity({
		Entity: Kind,
		body,
		orm,
		logger,
	}),
	update: async (body: Kind): AsyncResultError<Kind, ServiceError> => updateEntity({
		Entity: Kind,
		body,
		orm,
		logger,
	}),
	getOne: async (where: { id: number, userId: number }): AsyncResultError<Kind, ServiceError> => {
		logger.debug("[getOne]", where);
		try {
			const kind = await orm.em.fork().findOne(Kind, where);
			if (!kind) return [
				null,
				{
					code: "NOT_FOUND",
					error: new Error("kind not found"),
				},
			];
			return [kind, null];
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
	}: GetManyServiceParams<Kind, { query?: string }>): AsyncResultError<{ data: Kind[], total: number }, ServiceError> => {
		const { query } = filter || {};
		const where: FilterQuery<Kind> = { userId };
		if (query) {
			where.name = { $ilike: `%${query}%` };
		}
		return getManyEntities({
			Entity: Kind,
			where,
			pagination,
			sorting,
			orm,
			logger,
		})
	},
};
