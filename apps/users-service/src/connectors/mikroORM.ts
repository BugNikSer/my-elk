import { MikroORM } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { envVars } from "@env-vars";

export const orm = MikroORM.initSync({
    entitiesTs: ["./apps/users-service/src/entities"],
    metadataProvider: TsMorphMetadataProvider,
    dbName: envVars,
});
