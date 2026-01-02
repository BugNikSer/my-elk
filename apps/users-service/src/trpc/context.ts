import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { generateToken, getCookiesToken, parseCookies, parseToken, setCookieTokens } from '../utils/tokens';
import { decode } from 'jsonwebtoken';

export type TRPCContext = {
    ip: string;
    agent: string;
    res: CreateHTTPContextOptions["res"];
    userId: number | null;
    accessToken: string | null
    refreshToken: string | null
}

export async function createTRPCContext({
    req,
    res,
}: CreateHTTPContextOptions): Promise<TRPCContext> {
    const ip = req.socket.remoteAddress || "";
    const agent = req.headers["user-agent"] || "";
    const result = { ip, agent, res, userId: null, accessToken: null, refreshToken: null };

    const cookieTokensString = getCookiesToken({ req });
    if (!cookieTokensString) {
        return result;
    }

    const parsedStrTokens = { accessToken: null, refreshToken: null } as Record<"accessToken" | "refreshToken", string | null>;
    try {
        const { accessToken, refreshToken } = JSON.parse(cookieTokensString) as Partial<Pick<TRPCContext, "accessToken" | "refreshToken">>;
        if (!accessToken || !refreshToken) return result;
        parsedStrTokens.accessToken = accessToken;
        parsedStrTokens.refreshToken = refreshToken;
    } catch (e) {
        return result;
    }
    if (parsedStrTokens.accessToken === null && parsedStrTokens.refreshToken === null) return result;

    const [accessTokenPayload, accessTokenError] = parseToken(parsedStrTokens.accessToken);
    const [refreshTokenPayload, refreshTokenError] = parseToken(parsedStrTokens.refreshToken);

    // debug mode
    if (refreshTokenError?.message === "jwt expired" && accessTokenError?.message === "jwt expired") {
        console.log("both expired", decode(parsedStrTokens.accessToken), decode(parsedStrTokens.refreshToken))
        const newAccessToken = generateToken({ ip, agent, userId: 3 }, 0.1);
        const newRefreshToken = generateToken({ ip, agent, userId: 3 }, 0.2);

        if (newAccessToken || newRefreshToken) {
            return result;
        }

        setCookieTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            res,
            ttlHours: 0.01,
        });
        return { ...result, accessToken: newAccessToken, refreshToken: newRefreshToken, userId: 3 };
    }

    if (refreshTokenError) return result;

    if (accessTokenError) {
        if (accessTokenError.message !== "jwt expired" && !refreshTokenPayload) return result;

        // TODO: check ip and userAgent
        const newAccessToken = generateToken({ ip, agent, userId: 3 }, 0.1);
        const newRefreshToken = generateToken(refreshTokenPayload, 0.2);

        if (newAccessToken || newRefreshToken) {
            return result;
        }

        setCookieTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            res,
            ttlHours: 0.01,
        });
        return { ...result, accessToken: newAccessToken, refreshToken: newRefreshToken, userId: refreshTokenPayload.userId };
    }
    
    // TODO: check ip and userAgent
    return { ...result, ...accessTokenPayload };
}
