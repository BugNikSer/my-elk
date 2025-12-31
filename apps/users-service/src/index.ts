import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./trpc";
import envVars from "@my-elk/env-vars";
import { areaLogger } from "./utils/logger";

const logger = areaLogger("index")

const server = createHTTPServer({
    router: appRouter,
});

logger.info(`TRPC listening port ${envVars.USERS_SERVICE_PORT}`)
server.listen(envVars.USERS_SERVICE_PORT);
