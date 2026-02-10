import { orm } from "../mikroORM";
import { createEntity } from "@my-elk/helpers";

import { Kind } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

const logger = areaLogger("kinds-service");

export default {
    create: async (input: { name: string; userId: number }): AsyncResultError<Kind, ServiceError> => createEntity({
        Entity: Kind,
        input,
        orm,
        logger,
    }),
    getUsers: async (input: { userId: number }): AsyncResultError<Kind[], ServiceError> => {
        try {
            const kinds = await orm.em.fork().find(Kind, input);
            return [kinds, null];
        } catch (e) {
            logger.warn("[getAll]", e);
            return [
                null,
                {
                    code: "INTERNAL_SERVER_ERROR",
                    error: e as Error,
                },
            ];
        }
    },
    getOne: async (input: { id: number, userId: number }): AsyncResultError<Kind, ServiceError> => {
        try {
            const kind = await orm.em.fork().findOne(Kind, input);
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
};
