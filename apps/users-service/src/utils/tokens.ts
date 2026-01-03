import { generateToken, setCookieTokens } from "@my-elk/auth";
import { areaLogger } from "./logger";

import { TRPCContext } from "../trpc/context";
import { TRPCError } from "@trpc/server";

export const setTokens = ({
    userId,
    res,
    logger,
    methodName,
}: {
    userId: number;
    res: TRPCContext["res"];
    logger: ReturnType<typeof areaLogger>;
    methodName: string;
}) => {
    const [accessToken, accessTokenError] = generateToken({ userId });
    const [refreshToken, refreshTokenError] = generateToken({ userId }, 2);

    if (accessTokenError || refreshTokenError) {
        const errorsObj = {
            access: accessTokenError?.message || "generate",
            refresh: refreshTokenError?.message || "generate",
        }
        logger.http(`[${methodName}] generate tokens`, errorsObj);
        throw new TRPCError({
            message: `Can not generate tokens, ${JSON.stringify(errorsObj)}`,
            code: "INTERNAL_SERVER_ERROR",
        })
    }

    setCookieTokens({ accessToken, refreshToken, res });
};
