import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { AreaLogger } from "@my-elk/logger";
import { generateToken, parseToken } from "./tokens";
import envVars from "@my-elk/env-vars";

export const TOKENS_COOKIE_KEY = "tokens";

const DEFAULT_TTL_HOURS = 24;

const COOKIES_DEFAULT = `HttpOnly=true; Secure=${
    envVars.ENV === "development" ? "false" : "true"
}; SameSite=${
    envVars.ENV === "development" ? "None" : "Lax"
}; Path=/`;

export const parseCookies = (cookieString = "") => cookieString.split(";").reduce((acc, part) => {
    const [key, value] = part.trim().split("=");
    return { ...acc, [key]: value };
}, {} as Partial<Record<string, string>>);

export const getCookiesToken = ({
    req,
}: {
    req: CreateHTTPContextOptions["req"];
}) => parseCookies(req.headers.cookie)[TOKENS_COOKIE_KEY];

export const setCookieTokens = ({
    accessToken,
    refreshToken,
    res,
    ttlHours = DEFAULT_TTL_HOURS,
}: {
    accessToken: string;
    refreshToken: string;
    res: CreateHTTPContextOptions["res"];
    ttlHours?: number;
}) => res.setHeader(
    `Set-Cookie`,
    `${TOKENS_COOKIE_KEY}=${JSON.stringify({ accessToken, refreshToken })}; Max-Age=${ttlHours * 3_600_000}; ${COOKIES_DEFAULT}`
);

export const clearCookieTokens = ({ res }: { res: CreateHTTPContextOptions["res"]; }) => res.setHeader(
    `Set-Cookie`,
    `${TOKENS_COOKIE_KEY}=; Max-Age=0; ${COOKIES_DEFAULT}`
);

export const getDataFromCookieTokens = ({
    req,
    logger,
    ttlHours = DEFAULT_TTL_HOURS,
}: {
    req: CreateHTTPContextOptions["req"];
    logger: AreaLogger;
    ttlHours?: number;
}) => {
    const cookieTokensString = getCookiesToken({ req });
    if (!cookieTokensString) return null;

    let parsedAccessToken: string | null = null;
    let parsedRefreshToken: string | null = null;

    try {
        const { accessToken, refreshToken } = JSON.parse(cookieTokensString) as Partial<Record<string, string>>;
        if (!accessToken || !refreshToken) return null;

        parsedAccessToken = accessToken;
        parsedRefreshToken = refreshToken;
    } catch (e) {
        logger.debug("Failed to parse cookieTokensString", e);
        return null;
    }
    if (parsedAccessToken === null || parsedRefreshToken === null) return null;

    const [accessTokenPayload, accessTokenError] = parseToken(parsedAccessToken);
    const [refreshTokenPayload, refreshTokenError] = parseToken(parsedRefreshToken);

    if (refreshTokenError) return null;
    if (accessTokenError) {
        if (accessTokenError.message == "jwt expired" && refreshTokenPayload) {
            const [accessToken, atError] = generateToken(refreshTokenPayload, ttlHours > 0.5 ? - 0.5 : ttlHours);
            const [refreshToken, rtError] = generateToken(refreshTokenPayload, ttlHours);

            if (atError || rtError) return null;

            return { accessToken, refreshToken, ...refreshTokenPayload, refresh: true };
        } else {
            return null;
        }
    }

    return { accessToken: parsedAccessToken, refreshToken: parsedRefreshToken, ...accessTokenPayload, refresh: false };
}