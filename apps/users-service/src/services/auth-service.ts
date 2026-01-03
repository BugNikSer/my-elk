import { AsyncResultError, ResultError, ServiceError } from "@my-elk/result-error";
import { areaLogger } from "../utils/logger";

import { User } from "../mikroORM/entities/user.entity";
import usersService from "./users-service";
import { hashString } from "../utils/hash";

const logger = areaLogger("auth-service");

export default {
    login: async ({ email, password }: { email: string, password: string }): AsyncResultError<User, ServiceError> => {
        const [user, error] = await usersService.getBy({ email });
        if (error) return [null, error];

        const hashPwd = hashString(password);
        if (user.passwordHash !== hashPwd) return [
            null,
            {
                error: new Error("Wrong password"),
                code: "FORBIDDEN",
            }
        ];

        return [user, null];
    },
};
