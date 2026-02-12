import { orm } from "../mikroORM";
import { createEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { Kind } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";

const logger = areaLogger("kinds-service");

export default {
    create: async (body: { name: string; userId: number }): AsyncResultError<Kind, ServiceError> => createEntity({
        Entity: Kind,
        body,
        orm,
        logger,
    }),
    getOne: async (where: { id: number, userId: number }): AsyncResultError<Kind, ServiceError> => {
        logger.debug("[getOne]", where);
        try {
            const kind = await orm.em.fork().findOne(Kind, where);
            if (!kind) return [
                null,
                {
                    code: "NOT_FOUND",
                    error: new Error("kind not found"),
                },
            ];
            return [kind, null];
        } catch (e) {
            logger.warn("[getOne]", e);
            return [
                null,
                {
                    code: "INTERNAL_SERVER_ERROR",
                    error: e as Error,
                },
            ];
        }
    },
    getMany: async (where: { userId: number }): AsyncResultError<Kind[], ServiceError> => {
        logger.debug("[getMany]", where);
        try {
            const kinds = await orm.em.fork().find(Kind, where);
            return [kinds, null];
        } catch (e) {
            logger.warn("[getMany]", e);
            return [
                null,
                {
                    code: "INTERNAL_SERVER_ERROR",
                    error: e as Error,
                },
            ];
        }
    },
};
