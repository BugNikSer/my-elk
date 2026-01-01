import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./trpc";
import envVars from "@my-elk/env-vars";

import { areaLogger } from "./utils/logger";
import { initMikroORM } from "./mikroORM";

const logger = areaLogger("init-app");

initMikroORM();
const server = createHTTPServer({
    router: appRouter,
});

logger.info(`TRPC listening port ${envVars.USERS_SERVICE_PORT}, ${process.cwd()}`)
server.listen(envVars.USERS_SERVICE_PORT);
