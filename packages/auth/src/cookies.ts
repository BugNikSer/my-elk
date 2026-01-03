import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import createLogger from "@my-elk/logger";
import { generateToken, parseToken } from "./tokens";

export const TOKENS_COOKIE_KEY = "tokens";

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
    ttlHours = 3,
}: {
    accessToken: string;
    refreshToken: string;
    res: CreateHTTPContextOptions["res"];
    ttlHours?: number;
}) => res.setHeader(
    `Set-Cookie`,
    `${TOKENS_COOKIE_KEY}=${JSON.stringify({ accessToken, refreshToken })}; HttpOnly=true; Max-Age=${ttlHours * 3_600_000} Path=/`
);

export const clearCookieTokens = ({ res }: { res: CreateHTTPContextOptions["res"]; }) => res.setHeader(
    `Set-Cookie`,
    `${TOKENS_COOKIE_KEY}=; HttpOnly=true; Max-Age=0 Path=/`
);

export const getDataFromCookieTokens = ({
    req,
    logger,
}: {
    req: CreateHTTPContextOptions["req"];
    logger: ReturnType<ReturnType<typeof createLogger>["areaLogger"]>;
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
            const [accessToken, atError] = generateToken(refreshTokenPayload, 1);
            const [refreshToken, rtError] = generateToken(refreshTokenPayload, 2);

            if (atError || rtError) return null;

            return { accessToken, refreshToken, ...refreshTokenPayload, refresh: true };
        } else {
            return null;
        }
    }
    
    return { accessToken: parsedAccessToken, refreshToken: parsedRefreshToken, ...accessTokenPayload, refresh: false };;
}