import cors from 'cors';
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import envVars from "@my-elk/env-vars";

import { appRouter } from "./router";
import { createTRPCBackendContext } from "./context";
import { areaLogger } from "../utils/logger";

const logger = areaLogger("init-trpc");

export const initTrpcServer = () => {
    logger.info("Starting TRPC server...");
    const trpcServer = createHTTPServer({
        router: appRouter,
        basePath: "/users-trpc/",
        createContext: createTRPCBackendContext,
        middleware: cors({
            origin: envVars.WEB_URL,
            credentials: true,
        }),
    });

    trpcServer.listen(envVars.USERS_SERVICE_PORT, () => {
        logger.info("TRPC server listening port", envVars.USERS_SERVICE_PORT)
    });
};
