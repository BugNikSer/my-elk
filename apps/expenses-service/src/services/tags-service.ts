import { orm } from "../mikroORM";
import { createEntity } from "@my-elk/helpers";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";

import { Tag } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";

const logger = areaLogger("tags-service");

export default {
    create: async (body: { name: string; userId: number }): AsyncResultError<Tag, ServiceError> => createEntity({
        Entity: Tag,
        body,
        orm,
        logger,
    }),
    getOne: async (where: { id: number; userId: number }): AsyncResultError<Tag, ServiceError> => {
        logger.debug("[getOne]", where);
        try {
            const tag = await orm.em.fork().findOne(Tag, where);
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
    getMany: async (where: { id?: number | number[]; userId: number }): AsyncResultError<Tag[], ServiceError> => {
        logger.debug("[getMany]", where);
        try {
            const tags = await orm.em.fork().find(Tag, where);
            return [tags, null];
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
