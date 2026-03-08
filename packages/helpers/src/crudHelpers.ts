import { EntityDTO, FromEntityType, Populate, wrap, type FindOptions, type OrderDefinition } from "@mikro-orm/core";
import { TRPCError } from "@trpc/server";

import { AsyncResultError, ResultError, ServiceError } from "@my-elk/result-error";
import { AreaLogger } from "@my-elk/logger";
import { GetManyHelperParams, ServiceHelperAdditionalParams } from "./crudTypes";

export const createEntity = async <Result, EntityType extends { id: number }, EntityConstructorParams>({
    Entity,
    body,
    orm,
    populate,
    logger,
    skipFirstLogging,
}: {
    Entity: new (params: EntityConstructorParams) => EntityType;
    body: EntityConstructorParams;
} & ServiceHelperAdditionalParams<EntityType>): AsyncResultError<Result, ServiceError> => {
    if (!skipFirstLogging) logger.debug("[create]", body);

    let entity: EntityType;
    const em = orm.em.fork();

    // 1. Create new entity instance with provided body
    try {
        entity = new Entity(body);
        logger.debug("[create] Created entity instance", entity);
    } catch (e) {
        logger.warn("[create] Failed while creating class instance", e);
        return [null, { error: e as Error, code: "BAD_REQUEST"}];
    }

    // 2. Persist new entity to database
    try {
        em.persist(entity);
        logger.debug("[create] Persisted new entity", entity);
    } catch (e) {
        logger.warn("[create] Failed while persisting new entity", e);
        return [null, { error: e as Error, code: "CONFLICT"}];
    }
    
    // 3. Flush changes to database
    try {
        await em.flush();
        logger.debug("[create] Flushed changes to database", entity);
    } catch (e) {
        logger.warn("[create] Failed while committing changes", e);
        return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR"}];
    }

    // 4. Query created entity to return fresh data with populated relations
    try {
        const result = await em.findOne(Entity, { id: (entity as any).id }, { populate });
        logger.debug("[create] Queried created entity", result);
        return [wrap(result).toObject() as unknown as Result, null];
    } catch (e) {
        logger.warn("[create] Failed while querying created entity", e);
        return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR" }];
    }
};

export const updateEntity = async <EntityType extends { id: number }, EntityConstructorParams>({
    Entity,
    body,
    populate,
    orm,
    logger,
    skipFirstLogging,
}: {
    Entity: new (params: EntityConstructorParams) => EntityType;
    body: EntityConstructorParams & { id: number };
} & ServiceHelperAdditionalParams<EntityType>): AsyncResultError<EntityType, ServiceError> => {
        if (!skipFirstLogging) logger.debug("[update]", body);

        const em = orm.em.fork();
        let entity: EntityType;

        // 1. Query existing entity
        try {
            entity = await em.findOne(Entity, { id: body.id }, { populate });
            if (!entity) return [
                null,
                {
                    code: "NOT_FOUND",
                    error: new Error("Entity not found"),
                },
            ];
            logger.debug("[update] Queried entity", wrap(entity).toObject());
        } catch (e) {
            logger.warn(`[update] Failed while querying entity with id ${body.id}`, e);
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR" }];
        }

        // 2. Update entity properties with new values from body
        try {
            logger.debug("[update] Prepare body with new values", body);
            const preparedBody = Object.entries(body).reduce((acc, [bodyKey, bodyValue]) => {
                let entityKey = bodyKey;
                let newValue: any = bodyValue;

                // replace "relationId" with "relation" to match entity property
                if (bodyKey.endsWith("Id") && bodyKey !== "userId") {
                    entityKey = bodyKey.slice(0, -2);
                }
                // replace "relationIds" with "relations" to match entity collections
                if (bodyKey.endsWith("Ids")) {
                    entityKey = bodyKey.slice(0, -3) + "s";
                }
                // replace "dateISO" with "date" and convert to Date object
                if (bodyKey === "dateISO") {
                    entityKey = "date";
                    newValue = new Date(bodyValue);
                }

                acc[entityKey] = newValue;
                return acc;
            }, {} as Record<string, any>) as Partial<EntityDTO<FromEntityType<EntityType>, never>>;
            logger.debug("[update] Prepared body with new values", preparedBody);
            
            // Assign new values to entity instance
            wrap(entity, false).assign(preparedBody, { em, updateByPrimaryKey: true });
            logger.debug("[update] Prepared entity with new values", wrap(entity).toObject());

            await em.persist(entity);
        } catch (e) {
            logger.warn("[update] Failed while persisting updated entity", e);
            return [null, { error: e as Error, code: "BAD_REQUEST" }];
        }

        // 3. Flush changes to database
        try {
            await em.flush();
        } catch (e) {
            logger.warn("[update] Failed while committing changes", e);
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR" }];
        }

        // 4. Query updated entity to return fresh data with populated relations
        try {
            const result = await em.findOne(Entity, { id: body.id }, { populate });
            logger.debug("[update] Queried updated entity", wrap(result).toObject());
            return [result as EntityType, null];
        } catch (e) {
            logger.warn("[update] Failed while querying updated entity", e);
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR" }];
        }
    };

export const getManyEntities = async <
    Result,
    EntityType extends { id: number },
>({
    Entity,
    where,
    pagination,
    sorting = { field: "id", order: "DESC" },
    orm,
    logger,
    populate,
}: GetManyHelperParams<EntityType> & ServiceHelperAdditionalParams<EntityType>): AsyncResultError<{ data: Result[], total: number }, ServiceError> => {
    logger.debug("[getMany]", { where, pagination, sorting });

    const findOptions: FindOptions<EntityType> = {
        orderBy: { [sorting.field]: sorting.order } as OrderDefinition<EntityType>,
        populate: populate as Populate<EntityType>
    };
    if (pagination) {
        findOptions.limit = pagination.pageSize;
        findOptions.offset = (pagination.page - 1) * pagination.pageSize;
    }

    try {
        const em = orm.em.fork();
        const [total, entities] = await Promise.all([
            em.count(Entity, where),
            em.find(Entity, where, findOptions),
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