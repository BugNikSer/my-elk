import { initMikroORM } from "./mikroORM";
import { initTrpcServer } from "./trpc";
import { AppRouter } from "./trpc/router";

initMikroORM();
initTrpcServer();

export type { AppRouter };
export * from "./mikroORM/entities";
