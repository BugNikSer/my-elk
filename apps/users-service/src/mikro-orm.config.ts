import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import { Migrator } from '@mikro-orm/migrations'

import envVars from "@my-elk/env-vars";
import { areaLogger } from "./utils/logger";

const config = {
    entities: ["./src/mikroORM/entities"],
    entitiesTS: ["./src/mikroORM/entities"],
    baseDir: process.cwd(),
    dbName: envVars.USERS_SERVICE_POSTGRES_DB,
    host: envVars.USERS_SERVICE_HOST,
    port: envVars.USERS_SERVICE_POSTGRES_PORT,
    user: envVars.USERS_SERVICE_POSTGRES_USER,
    password: envVars.USERS_SERVICE_POSTGRES_PASSWORD,
    logger: areaLogger,
    driver: PostgreSqlDriver,
    metadataProvider: TsMorphMetadataProvider,
    highlighter: new SqlHighlighter(),
    extensions: [Migrator],
    migrations: {
        path: "./src/mikroORM/migrations"
    }
} as Options<PostgreSqlDriver>;

export default config;
