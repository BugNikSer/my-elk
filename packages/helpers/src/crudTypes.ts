import type { Populate, PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql";
import { Entity, type Connection, type EntityClass, type EntityManager, type FilterQuery, type IDatabaseDriver, type MikroORM } from "@mikro-orm/core";
import { AreaLogger } from "@my-elk/logger";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

export type GetManyServiceParams<
    EntityType,
    FilterType extends Record<string, any>,
> = {
    userId: number;
    filter?: FilterType;
    pagination?: { page: number; pageSize: number };
    sorting?: { field: keyof EntityType; order: "ASC" | "DESC" };
};

export type ServiceHelperAdditionalParams<EntityType> = {
    orm: MikroORM<PostgreSqlDriver, SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>>;
    logger: AreaLogger;
    skipFirstLogging?: boolean;
    populate?: Populate<EntityType>;
};

export type GetManyHelperParams<
    EntityType,
> = {
    pagination?: { page: number; pageSize: number };
    sorting?: { field: keyof EntityType; order: "ASC" | "DESC" };
    Entity: new (params: any) => EntityType;
    where: FilterQuery<EntityType>;
} & ServiceHelperAdditionalParams<EntityType>;
