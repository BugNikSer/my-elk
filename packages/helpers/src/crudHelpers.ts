import { Populate, wrap, type FindOptions, type OrderDefinition } from "@mikro-orm/core";
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

    try {
        entity = new Entity(body);
    } catch (e) {
        logger.warn("Failed while creating class instance", e);
        return [null, { error: e as Error, code: "BAD_REQUEST"}];
    }

    try {
        em.persist(entity);
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

    try {
        const result = await em.findOne(Entity, { id: (entity as any).id }, { populate });
        return [wrap(result).toObject() as unknown as Result, null];
    } catch (e) {
        logger.warn("Failed while querying created entity", e);
        return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR" }];
    }
};

export const updateEntity = async <EntityType extends object, EntityConstructorParams>({
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

        try {
            entity = await em.findOne(Entity, { id: body.id });
            logger.debug("[update] Queried entity", entity);
            if (!entity) return [
                null,
                {
                    code: "NOT_FOUND",
                    error: new Error("Entity not found"),
                },
            ];
        } catch (e) {
            logger.warn(`[update] Failed while querying entity with id ${body.id}`, e);
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR" }];
        }

        try {
            logger.debug("[update] Updating entity with new values", body);
            Object.keys(body).forEach(bodyKey => {
                if (bodyKey === "id") return;
                let entityKey = bodyKey;
                if (bodyKey.endsWith("Id") && bodyKey !== "userId") {
                    entityKey = bodyKey.slice(0, -2);
                }
                (entity as any)[entityKey] = (body as any)[bodyKey];
            });
            logger.debug("[update] Prepared entity with new values", entity);
            await em.persist(entity);
        } catch (e) {
            logger.warn("[update] Failed while persisting updated entity", e);
            return [null, { error: e as Error, code: "BAD_REQUEST" }];
        }

        try {
            console.log("======= flushing changes =======");
            await em.flush();
            console.log("======= flush successful =======");
        } catch (e) {
            logger.warn("[update] Failed while committing changes", e);
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR" }];
        }

        try {
            console.log("======= querying updated entity =======");
            const result = await em.findOne(Entity, { id: body.id }, { populate });
            logger.debug("[update] Queried updated entity", result);
            return [result as EntityType, null];
        } catch (e) {
            console.log("======= failed to query updated entity =======");
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