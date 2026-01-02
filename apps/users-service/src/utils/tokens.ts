import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import jwt from "jsonwebtoken";
import envVars from "@my-elk/env-vars";
import { ResultError } from "../types";

export interface TokenPayload {
    ip: string;
    agent: string;
    userId: number;
}

export const generateToken = (payload: TokenPayload, ttlHours = 1): ResultError<string> => {
    const { AUTH_SECRET } = envVars;
    if (!AUTH_SECRET) return [null, new Error("Missing AUTH_SECRET")];
    return [jwt.sign(payload, AUTH_SECRET, { expiresIn: `${ttlHours}Hours` }), null];
};

export const parseToken = (token: string): ResultError<TokenPayload> => {
    const { AUTH_SECRET } = envVars;
    if (!AUTH_SECRET) return [null, new Error("Missing AUTH_SECRET")];

    try {
        const verified = jwt.verify(token, AUTH_SECRET);
        console.log(verified);
        return [verified as TokenPayload, null];
    } catch (e) {
        return [null, e as Error]
    }
};

export const parseCookies = (cookieString = "") => cookieString.split(";").reduce((acc, part) => {
    const [key, value] = part.trim().split("=");
    return { ...acc, [key]: value };
}, {} as Partial<Record<string, string>>);

// =========
export const TOKENS_COOKIE_KEY = "tokens";

export const getCookiesToken = ({
    req,
}: {
    req: CreateHTTPContextOptions["req"];
}) => parseCookies(req.headers.cookie)[TOKENS_COOKIE_KEY];

export const setCookieTokens = ({
    accessToken,
    refreshToken,
    res,
    ttlHours = 1,
}: {
    accessToken: string;
    refreshToken: string;
    res: CreateHTTPContextOptions["res"];
    ttlHours?: number;
}) => res.setHeader(
    `Set-Cookie`,
    `${TOKENS_COOKIE_KEY}=${JSON.stringify({ accessToken, refreshToken })}; HttpOnly=true; Max-Age=${ttlHours * 3_600_000} Path=/`
);
