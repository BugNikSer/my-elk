import { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql";
import { Connection, EntityClass, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { TRPCError } from "@trpc/server";

import { AsyncResultError, ResultError, ServiceError } from "@my-elk/result-error";
import { AreaLogger } from "@my-elk/logger";

export const createEntity = async <EntityType, EntityConstructorParams>({
    Entity,
    body,
    orm,
    logger,
    skipFirstLogging,
}: {
    Entity: new (params: EntityConstructorParams) => EntityType;
    body: EntityConstructorParams;
    orm: MikroORM<PostgreSqlDriver, SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>>;
    logger: AreaLogger;
    skipFirstLogging?: boolean;
}): AsyncResultError<EntityType, ServiceError> => {
        if (!skipFirstLogging) logger.debug("[create]", body);

        let entity: EntityType;
        const em = orm.em.fork();

        try {
            entity = new Entity(body);
        } catch (e) {
            logger.warn("Failed to create class instance", e);
            return [null, { error: e as Error, code: "BAD_REQUEST"}];
        }

        try {
            em.persist(entity as EntityClass<any>);
        } catch (e) {
            logger.warn("Failed to insert", e);
            return [null, { error: e as Error, code: "CONFLICT"}];
        }
        
        try {
            await em.flush();
        } catch (e) {
            logger.warn("Failed to save changes after inserting", e);
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR"}];
        }

        return [entity, null];
};

export const preloadLinkedEntities = async <
    Body extends Record<string, any>,
    Service extends {
        getOne: (params: any) => AsyncResultError<any, ServiceError>;
        getMany: (params: any) => AsyncResultError<any[], ServiceError>;
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
        let response: ResultError<any | any[], ServiceError>;
        if (Array.isArray(id)) {
            response = await service.getMany({ id, userId });
        } else {
            response = await service.getOne({ id, userId });
        }
        const [result, error] = response;
        if (error) return error;
        body[field] = result;
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

export const handleServiceError = <Result>({
    result,
    methodName,
    logger,
}: {
    result: ResultError<Result, ServiceError>;
    methodName: string;
    logger: AreaLogger;
}): Result => {
    const [user, userError] = result;
    if (userError) {
        logger.warn(methodName, userError);
        throw new TRPCError({
            message: userError.error.message,
            code: userError.code,
        });
    }
    return user;
};