import { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql";
import { Connection, EntityClass, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import { AsyncResultError, ServiceError } from "@my-elk/result-error";
import { AreaLogger } from "@my-elk/logger";

export const createEntity = async <E, P>({
    Entity,
    input,
    orm,
    logger,
    skipFirstLogging,
}: {
    Entity: new (params: P) => E;
    input: P;
    orm: MikroORM<PostgreSqlDriver, SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>>;
    logger: AreaLogger;
    skipFirstLogging?: boolean;
}): AsyncResultError<E, ServiceError> => {
        if (!skipFirstLogging) logger.debug("[create]", input);

        let entity: E;
        const em = orm.em.fork();

        try {
            entity = new Entity(input);
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
