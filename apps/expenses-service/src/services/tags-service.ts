import { orm } from "../mikroORM";
import { createEntity } from "@my-elk/helpers";

import { Tag } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

const logger = areaLogger("tags-service");

export default {
    create: async (input: { name: string; userId: number }): AsyncResultError<Tag, ServiceError> => createEntity({
        Entity: Tag,
        input,
        orm,
        logger,
    }),
    getUsers: async (input: { userId: number }): AsyncResultError<Tag[], ServiceError> => {
        try {
            const tags = await orm.em.fork().find(Tag, input);
            return [tags, null];
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
    getOne: async (input: { id: number, userId: number }): AsyncResultError<Tag, ServiceError> => {
        try {
            const tag = await orm.em.fork().findOne(Tag, input);
            if (!tag) return [
                null,
                {
                    code: "NOT_FOUND",
                    error: new Error("tag not found"),
                },
            ];
            return [tag, null];
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
