import type { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql";
import type { Connection, EntityClass, EntityManager, FilterQuery, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { AreaLogger } from "@my-elk/logger";

export type GetManyServiceParams<
    EntityType,
    FilterType extends Record<string, any>,
> = {
    userId: number;
    filter?: FilterType;
    pagination?: { page: number; pageSize: number };
    sorting?: { field: keyof EntityType; order: "ASC" | "DESC" };
};

export type GetManyHelperParams<
    EntityType,
    FilterType extends Record<string, any>,
> = Omit<GetManyServiceParams<EntityType, FilterType>, "filter" | "userId"> & {
    Entity: new (params: any) => EntityType;
    where: FilterQuery<EntityType>;
} & ServiceHelperAdditionalParams;

export type ServiceHelperAdditionalParams = {
    orm: MikroORM<PostgreSqlDriver, SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<Connection>>>;
    logger: AreaLogger;
    skipFirstLogging?: boolean;
};