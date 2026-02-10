import cors from 'cors';
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import envVars from "@my-elk/env-vars";

import { appRouter } from "./router";
import { createTRPCBackendContext } from "./context";
import { areaLogger } from "../utils/logger";

const logger = areaLogger("init-trpc");

export const initTrpcServer = () => {
    const trpcServer = createHTTPServer({
        router: appRouter,
        basePath: "/expenses-trpc/",
        createContext: createTRPCBackendContext,
        middleware: cors({
            origin: envVars.WEB_URL,
            credentials: true,
        }),
    });

    trpcServer.listen(envVars.EXPENSES_SERVICE_PORT, () => {
        logger.info("TRPC server listening port", envVars.EXPENSES_SERVICE_PORT)
    });
};