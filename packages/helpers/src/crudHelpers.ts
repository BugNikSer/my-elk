import type { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql";
import type { Connection, EntityClass, EntityManager, FilterQuery, FindOptions, IDatabaseDriver, MikroORM, OrderDefinition } from "@mikro-orm/core";
import { TRPCError } from "@trpc/server";

import { AsyncResultError, ResultError, ServiceError } from "@my-elk/result-error";
import { AreaLogger } from "@my-elk/logger";
import { GetManyHelperParams, GetManyServiceParams, ServiceHelperAdditionalParams } from "./crudTypes";

export const createEntity = async <EntityType, EntityConstructorParams>({
    Entity,
    body,
    orm,
    logger,
    skipFirstLogging,
}: {
    Entity: new (params: EntityConstructorParams) => EntityType;
    body: EntityConstructorParams;
} & ServiceHelperAdditionalParams): AsyncResultError<EntityType, ServiceError> => {
        if (!skipFirstLogging) logger.debug("[create]", body);

        let entity: EntityType;
        const em = orm.em.fork();

        try {
            entity = new Entity(body);
        } catch (e) {
            logger.warn("Failed while creating class instance", e);
            return [null, { error: e as Error, code: "BAD_REQUEST"}];
        }

        try {
            em.persist(entity as EntityClass<any>);
        } catch (e) {
            logger.warn("Failed while persisting new entity", e);
            return [null, { error: e as Error, code: "CONFLICT"}];
        }
        
        try {
            await em.flush();
        } catch (e) {
            logger.warn("Failed while committing changes", e);
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR"}];
        }

        return [entity, null];
};

export const updateEntity = async <EntityType, EntityConstructorParams>({
    Entity,
    body,
    orm,
    logger,
}: {
    Entity: new (params: EntityConstructorParams) => EntityType;
    body: EntityConstructorParams & { id: number };
} & ServiceHelperAdditionalParams): AsyncResultError<EntityType, ServiceError> => {
        logger.debug("[update]", body);

        const em = orm.em.fork();
        let entity: EntityType;

        try {
            entity = await em.findOne(Entity, { id: body.id });
            if (!entity) return [
                null,
                {
                    code: "NOT_FOUND",
                    error: new Error("Entity not found"),
                },
            ];
        } catch (e) {
            logger.warn(`Failed while querying entity with id ${body.id}`, e);
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR" }];
        }

        try {
            Object.keys(body).forEach(key => {
                if (key === "id") return;
                (entity as any)[key] = (body as any)[key];
            });
            await em.persist(entity);
        } catch (e) {
            logger.warn("Failed while persisting updated entity", e);
            return [null, { error: e as Error, code: "BAD_REQUEST" }];
        }

        try {
            await em.flush();
        } catch (e) {
            logger.warn("Failed while committing changes", e);
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR" }];
        }

        return [entity, null];
    };

export const preloadLinkedEntities = async <
    Body extends Record<string, any>,
    Service extends {
        getOne: (params: { id: number; userId: number }) => AsyncResultError<any, ServiceError>;
        getMany: (params: GetManyServiceParams<any, {}>) => AsyncResultError<{data: any[], total: number}, ServiceError>;
    },
>({
    body,
    userId,
    config,
}: {
    body: Body;
    userId: number;
    config: {
        service: Service;
        field: keyof Body;
        id?: number | number[];
    }[],
}): Promise<ServiceError | null> => {
    const errors = await Promise.all(config.map(async ({ service, field, id }) => {
        if (id === undefined) return null;
        if (Array.isArray(id)) {
            const response = await service.getMany({ userId, filter: { id: { $in: id } } });
            const [result, error] = response;
            if (error) return error;
            body[field] = result.data as Body[typeof field];
        } else {
            const [result, error] = await service.getOne({ id, userId });
            if (error) return error;
            body[field] = result;
        }
        return null;
    }));

    const filteredErrors = errors.filter(er => er !== null);

    if (filteredErrors.length) {
        let worstErrorCode: ServiceError["code"] = "NOT_FOUND";
        if (filteredErrors.some((e) => e.code === "INTERNAL_SERVER_ERROR")) {
            worstErrorCode = "INTERNAL_SERVER_ERROR";
        }
        return {
            code: worstErrorCode,
            error: new Error(filteredErrors.map(e => e.error.message).join(". ")),
        };
    }

    return null;
};

export const getManyEntities = async <
    EntityType extends { id: number },
    FilterType extends Record<string, any>,
>({
    Entity,
    where,
    pagination,
    sorting = { field: "id", order: "DESC" },
    orm,
    logger,
}: GetManyHelperParams<EntityType, FilterType> & ServiceHelperAdditionalParams): AsyncResultError<{ data: EntityType[], total: number }, ServiceError> => {
    logger.debug("[getMany]", { where, pagination, sorting });

    const limitOffset = pagination ? {
        limit: pagination.pageSize,
        offset: (pagination.page - 1) * pagination.pageSize,
    } : {};
    const options: FindOptions<EntityType> = {
        orderBy: { [sorting.field]: sorting.order } as OrderDefinition<EntityType>,
        ...(limitOffset)
    };

    try {
        const em = orm.em.fork();
        const [total, data] = await Promise.all([
            em.count(Entity, where),
            em.find(Entity, where, options),
        ]);
        return [{ data, total }, null];
    } catch (e) {
        logger.warn("[getMany]", e);
        return [
            null,
            {
                code: "INTERNAL_SERVER_ERROR",
                error: e as Error,
            },
        ];
    }
}

export const handleServiceError = <Result>({
    response,
    methodName,
    logger,
}: {
    response: ResultError<Result, ServiceError>;
    methodName: string;
    logger: AreaLogger;
}): Result => {
    const [result, error] = response;
    if (error) {
        logger.warn(methodName, error);
        throw new TRPCError({
            message: error.error.message,
            code: error.code,
        });
    }
    return result;
};