import { AsyncResultError, ResultError, ServiceError } from "@my-elk/result-error";
import { createEntity } from "@my-elk/helpers";

import { UserCreateInput, UserGetByInput } from "../mikroORM/types/user";
import { areaLogger } from "../utils/logger";
import { orm } from "../mikroORM";
import { User } from "../mikroORM/entities/user.entity";

const logger = areaLogger("users-service");

export default {
    getBy: async (input: UserGetByInput): Promise<ResultError<User, ServiceError>> => {
        logger.debug("[getBy]", input)
        if (!("id" in input) && !("email" in input)) return [
            null,
            {
                error: new Error("Empty User search parameters"),
                code: "BAD_REQUEST",
            },
        ];

        try {
            const user = await orm.em.fork().findOne(User, input);
            if (!user) return [
                null,
                {
                    error: new Error(`User with parameter ${JSON.stringify(input)} not found`),
                    code: "NOT_FOUND",
                },
            ];
            return [user, null];
        } catch (e) {
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR" }];
        }
    },
    create: async (body: UserCreateInput): AsyncResultError<User, ServiceError> => createEntity({
        Entity: User,
        body,
        orm,
        logger,
    })
};
