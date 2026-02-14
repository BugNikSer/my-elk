import { type TRPC_ERROR_CODE_KEY } from "@trpc/server";
import { createEntity, getManyEntities, preloadLinkedEntities } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { orm } from "../mikroORM";
import { Product } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import categoriesService from "./categories-service";
import kindsService from "./kinds-service";

const logger = areaLogger("products-service");

export default {
	create: async (body: {
		name: string;
		userId: number;
		defaultCategoryId?: number;
		defaultKindId?: number;
	}): AsyncResultError<Product, ServiceError> => {
		logger.debug("[create]", body);

		const { name, userId, defaultCategoryId, defaultKindId } = body;
		const processedBody: ConstructorParameters<typeof Product>[0] = { name, userId };

		const preloadError = await preloadLinkedEntities({
			body: processedBody,
			userId,
			config: [
				{ service: categoriesService, field: "defaultCategory", id: defaultCategoryId } as const,
				{ service: kindsService, field: "defaultKind", id: defaultKindId } as const,
			],
		});
		if (preloadError) return [null, preloadError];

		return createEntity({ Entity: Product, body: processedBody, logger, orm, skipFirstLogging: true });
	},
	getOne: async (where: { id: number, userId: number; }): AsyncResultError<Product, ServiceError> => {
		logger.debug("[getOne]", where);
		try {
			const product = await orm.em.fork().findOne(Product, where);
			if (!product) return [
				null,
				{
					code: "NOT_FOUND",
					error: new Error("product not found"),
				},
			];
			return [product, null];
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
	}: {
		userId: number;
		filter?: {};
		pagination?: { page: number; pageSize: number };
		sorting?: { field: keyof Product; order: "ASC" | "DESC" };
	}): AsyncResultError<{ data: Product[], total: number }, ServiceError> => {
		const where = { userId, ...filter };
		return getManyEntities({
			Entity: Product,
			where,
			pagination,
			sorting,
			orm,
			logger,
		})
	},
};
