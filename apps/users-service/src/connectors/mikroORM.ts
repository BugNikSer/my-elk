import { MikroORM } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import envVars from "@my-elk/env-vars";
import { areaLogger } from "../utils/logger";

export const orm = MikroORM.initSync({
    entitiesTs: ["./apps/users-service/src/entities"],
    metadataProvider: TsMorphMetadataProvider,
    dbName: envVars.USERS_SERVICE_POSTGRES_DB,
    host: envVars.USERS_SERVICE_HOST,
    port: envVars.USERS_SERVICE_POSTGRES_PORT,
    user: envVars.USERS_SERVICE_POSTGRES_USER,
    password: envVars.USERS_SERVICE_POSTGRES_PASSWORD,
    logger: areaLogger,
});
