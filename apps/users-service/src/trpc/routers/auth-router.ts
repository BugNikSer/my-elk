import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateToken, setCookieTokens, clearCookieTokens } from "@my-elk/auth";
import { ResultError, ServiceError } from "@my-elk/result-error";

import { User } from "../../mikroORM/entities/user.entity";
import { router, publicProcedure, authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";
import usersService from "../../services/users-service";
import authService from "../../services/auth-service";
import { setTokens } from "../../utils/tokens";

const logger = areaLogger("auth-router");

const formInput = z.object({ email: z.email(), password: z.string() });

const AlreadyLoggedInError = new TRPCError({
    message: "Already logged in",
    code: "FORBIDDEN"
});

const handleUserError = ({
    userResult,
    methodName,
}: {
    userResult: ResultError<User, ServiceError>;
    methodName: string;
}) => {
    const [user, userError] = userResult;
    if (userError) {
        logger.warn(methodName, userError);
        throw new TRPCError({
            message: userError.error.message,
            code: userError.code,
        });
    }
    return user;
};

export default router({
    register: publicProcedure
        .input(formInput)
        .mutation(async ({ ctx: { userId, res }, input }) => {
            if (userId !== null) throw AlreadyLoggedInError;

            const userResult = await usersService.create(input);
            const user = handleUserError({ userResult, methodName: "register" });

            setTokens({ res, userId: Number(userId), logger, methodName: "register" });
            return user;
        }),
    login: publicProcedure
        .input(formInput)
        .query(async ({ ctx: { userId, res }, input }) => {
            if (userId !== null) throw AlreadyLoggedInError;

            const userResult = await authService.login(input);
            const user = handleUserError({ userResult, methodName: "register" });

            setTokens({ res, userId: Number(userId), logger, methodName: "login" });

            return user;
        }),
    logout: authedProcedure.query(({ ctx: { res } }) => {
        clearCookieTokens({ res });
        return "logged out";
    }),
    check: authedProcedure.query(async ({ ctx: { userId } }) => {
        console.log("check called", userId)
        if (!userId) return null;

        const userResult = await usersService.getBy({ id: userId });
        const user = handleUserError({ userResult, methodName: "check" });

        return user;
    }),
})