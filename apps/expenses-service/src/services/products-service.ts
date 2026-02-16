import { createEntity, getManyEntities, GetManyServiceParams, updateEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { orm } from "../mikroORM";
import { ProductDTO } from "../mikroORM/entityDTO";
import { Category, Kind, Product } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { EntityDTO, FilterQuery, wrap } from "@mikro-orm/core";

const logger = areaLogger("products-service");

export default {
	create: async (rawBody: {
		name: string;
		userId: number;
		defaultCategory?: number;
		defaultKind?: number;
	}): AsyncResultError<ProductDTO, ServiceError> => {
		logger.debug("[create]", rawBody);

		const {
			defaultCategory: defaultCategoryId,
			defaultKind: defaultKindId,
			...restBody
		} = rawBody;

		const body: Omit<Product, "id"> = {
			...restBody,
			defaultCategory: defaultCategoryId ? orm.em.getReference(Category, defaultCategoryId) : undefined,
			defaultKind: defaultKindId ? orm.em.getReference(Kind, defaultKindId) : undefined
		};

		const result = createEntity({
			Entity: Product,
			body,
			orm,
			logger,
			skipFirstLogging: true,
		});

		return result as AsyncResultError<ProductDTO, ServiceError>;
	},
	update: async ({
		defaultCategory,
		defaultKind,
		...restBody
	}: {
		name: string;
		userId: number;
		defaultCategory?: number;
		defaultKind?: number;
		id: number;
}
): AsyncResultError<ProductDTO, ServiceError> => {
		const body: ConstructorParameters<typeof Product>[0] & { id: number } = {
			...restBody,
			defaultCategory: defaultCategory ? orm.em.fork().getReference(Category, defaultCategory) : undefined,
			defaultKind: defaultKind ? orm.em.fork().getReference(Kind, defaultKind) : undefined,
		}
		return updateEntity({
			Entity: Product,
			body,
			orm,
			logger,
		})
	},
	getOne: async (where: { id: number, userId: number }): AsyncResultError<ProductDTO, ServiceError> => {
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
			const w = wrap(product).toObject();
			return [wrap(product).toObject() as unknown as ProductDTO, null];
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
	}: GetManyServiceParams<ProductDTO, { query?: string; id?: number | number[] }>): AsyncResultError<{ data: ProductDTO[], total: number }, ServiceError> => {
		const { query, id } = filter || {};
		const where: FilterQuery<Product> = { userId };

		if (query) {
			where.name = { $ilike: `%${query}%` };
		}
		if (id !== undefined) where.id = id;
		
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
