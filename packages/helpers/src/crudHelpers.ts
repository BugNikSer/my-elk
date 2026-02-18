import { Populate, wrap, type EntityClass, type EntityDTO, type FindOptions, type OrderDefinition } from "@mikro-orm/core";
import { TRPCError } from "@trpc/server";

import { AsyncResultError, ResultError, ServiceError } from "@my-elk/result-error";
import { AreaLogger } from "@my-elk/logger";
import { GetManyHelperParams, GetManyServiceParams, ServiceHelperAdditionalParams } from "./crudTypes";

export const createEntity = async <Result, EntityType extends object, EntityConstructorParams>({
    Entity,
    body,
    orm,
    logger,
    skipFirstLogging,
}: {
    Entity: new (params: EntityConstructorParams) => EntityType;
    body: EntityConstructorParams;
} & ServiceHelperAdditionalParams): AsyncResultError<Result, ServiceError> => {
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

        return [wrap(entity).toObject() as Result, null];
};

export const updateEntity = async <Result, EntityType extends object, EntityConstructorParams>({
    Entity,
    body,
    orm,
    logger,
}: {
    Entity: new (params: EntityConstructorParams) => EntityType;
    body: EntityConstructorParams & { id: number };
} & ServiceHelperAdditionalParams): AsyncResultError<Result, ServiceError> => {
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

        return [wrap(entity).toObject() as Result, null];
    };

export const getManyEntities = async <
    Result,
    EntityType extends { id: number },
    FilterType extends Record<string, any>,
>({
    Entity,
    where,
    pagination,
    sorting = { field: "id", order: "DESC" },
    orm,
    logger,
    populate,
}: GetManyHelperParams<EntityType, FilterType> & ServiceHelperAdditionalParams): AsyncResultError<{ data: Result[], total: number }, ServiceError> => {
    logger.debug("[getMany]", { where, pagination, sorting });

    const limitOffset = pagination ? {
        limit: pagination.pageSize,
        offset: (pagination.page - 1) * pagination.pageSize,
    } : {};
    const options: FindOptions<EntityType> = {
        orderBy: { [sorting.field]: sorting.order } as OrderDefinition<EntityType>,
        ...(limitOffset),
        populate: populate as Populate<EntityType>
    };

    try {
        const em = orm.em.fork();
        const [total, entities] = await Promise.all([
            em.count(Entity, where),
            em.find(Entity, where, options),
        ]);
        return [
            {
                data: (entities as EntityType[]).map((e) => wrap(e).toObject()) as Result[],
                total
            },
            null,
        ];
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