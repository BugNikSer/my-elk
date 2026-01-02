import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from 'cors';
import envVars from "@my-elk/env-vars";

import { appRouter } from "./router";
import { createTRPCContext } from "./context";
import { areaLogger } from "../utils/logger";

const logger = areaLogger("init-trpc");

export const initTrpcServer = () => {
    const trpcServer = createHTTPServer({
        router: appRouter,
        basePath: "/trpc/",
        createContext: createTRPCContext,
        middleware: cors(),
    });

    trpcServer.listen(envVars.USERS_SERVICE_PORT, () => {
        logger.info("TRPC server listening port", envVars.USERS_SERVICE_PORT)
    });
};
