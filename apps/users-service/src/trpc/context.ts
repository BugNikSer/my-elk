import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { getCookiesToken, getDataFromCookieTokens, parseCookies, setCookieTokens } from '@my-elk/auth';
import { areaLogger } from '../utils/logger';

const logger = areaLogger("trpc-context");

export type TRPCContext = {
    res: CreateHTTPContextOptions["res"];
    userId: number | null;
    accessToken: string | null
    refreshToken: string | null
}

export async function createTRPCBackendContext({
    req,
    res,
}: CreateHTTPContextOptions): Promise<TRPCContext> {
    try {
        const payload = getDataFromCookieTokens({ req, logger });

        if (payload === null) {
            return { res, userId: null, accessToken: null, refreshToken: null };
        }

        const {
            refresh,
            userId,
            accessToken,
            refreshToken,
        } = payload;

        if (refresh) setCookieTokens({
            accessToken,
            refreshToken,
            res,
        });

        return { res, userId, accessToken, refreshToken }
    } catch (e) {
        logger.error(e);
        throw e;
    }
}
