import { MikroORM } from "@mikro-orm/core";
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'

import { areaLogger } from "../utils/logger";
import mikroORMConfig from "../mikro-orm.config";

const logger = areaLogger("init-orm");
export let orm: MikroORM<PostgreSqlDriver>

export const initMikroORM = async () => {
    try {
        orm = await MikroORM.init(mikroORMConfig);
        logger.info("Initialized")
    } catch (e) {
        logger.error(e);
        throw e;
    }
};
