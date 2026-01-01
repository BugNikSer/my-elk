import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./trpc";
import envVars from "@my-elk/env-vars";

import { areaLogger } from "./utils/logger";
import { initMikroORM } from "./mikroORM";

const logger = areaLogger("init-app");

initMikroORM();
const trpcServer = createHTTPServer({
    router: appRouter,
    basePath: "/trpc/"
});

trpcServer.listen(envVars.USERS_SERVICE_PORT, () => {
    logger.info("TRPC server listening port", envVars.USERS_SERVICE_PORT)
});
