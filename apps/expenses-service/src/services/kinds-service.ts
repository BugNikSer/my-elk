import { orm } from "../mikroORM";
import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { Kind } from "../mikroORM/entities";
import { KindDTO } from "../mikroORM/entityDTO";
import { areaLogger } from "../utils/logger";
import { get } from "node:http";
import { FilterQuery } from "@mikro-orm/core";

const logger = areaLogger("kinds-service");

export default {
	create: async (body: Omit<KindDTO, "id">): AsyncResultError<KindDTO, ServiceError> => {
		const result = createEntity({
			Entity: Kind,
			body,
			orm,
			logger,
		})
		return result as AsyncResultError<KindDTO, ServiceError>;
	},
	update: async (body: KindDTO): AsyncResultError<KindDTO, ServiceError> => {
		const result = updateEntity({
			Entity: Kind,
			body,
			orm,
			logger,
		})
		return result as AsyncResultError<KindDTO, ServiceError>;
	},
	getOne: async (where: { id: number, userId: number }): AsyncResultError<KindDTO, ServiceError> => {
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
	}: GetManyServiceParams<KindDTO, {
		query?: string;
		id?: number | number[];
	}>): AsyncResultError<{ data: KindDTO[], total: number }, ServiceError> => {
		const { query, id } = filter || {};
		const where: FilterQuery<KindDTO> = { userId };

		if (query) {
			where.name = { $ilike: `%${query}%` };
		}
		if (id !== undefined) where.id = id;
		
		const result = getManyEntities({
			Entity: Kind,
			where,
			pagination,
			sorting,
			orm,
			logger,
		});

		return result as AsyncResultError<{ data: KindDTO[], total: number }, ServiceError>;
	},
};
