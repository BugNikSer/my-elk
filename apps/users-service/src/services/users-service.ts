import { UserCreateInput, UserGetByInput } from "../mikroORM/types/user";
import { areaLogger } from "../utils/logger";
import { orm } from "../mikroORM";
import { User } from "../mikroORM/entities/user.entity";
import { AsyncResultError, ServiceError } from "../types";

const logger = areaLogger("users-service");

export default {
    getBy: async (input: UserGetByInput): AsyncResultError<User, ServiceError> => {
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
    create: async (input: UserCreateInput): AsyncResultError<User, ServiceError> => {
        let user: User;
        const em = orm.em.fork();

        try {
            user = new User(input);
        } catch (e) {
            logger.warn("Failed to create User class instance", e);
            return [null, { error: e as Error, code: "BAD_REQUEST"}];
        }

        try {
            em.persist(user);
        } catch (e) {
            logger.warn("Failed to insert User", e);
            return [null, { error: e as Error, code: "CONFLICT"}];
        }
        
        try {
            await em.flush();
        } catch (e) {
            logger.warn("Failed to save changes after inserting User", e);
            return [null, { error: e as Error, code: "INTERNAL_SERVER_ERROR"}];
        }

        return [user, null];
    }
};
