import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import jwt from "jsonwebtoken";
import envVars from "@my-elk/env-vars";
import type { ResultError } from "@my-elk/result-error";

export interface TokenPayload {
    userId: number;
}

export const generateToken = (payload: TokenPayload, ttlHours: number): ResultError<string> => {
    const { AUTH_SECRET } = envVars;
    if (!AUTH_SECRET) return [null, new Error("Missing AUTH_SECRET")];
    return [jwt.sign(payload, AUTH_SECRET, { expiresIn: `${ttlHours}Hours` }), null];
};

export const parseToken = (token: string): ResultError<TokenPayload> => {
    const { AUTH_SECRET } = envVars;
    if (!AUTH_SECRET) return [null, new Error("Missing AUTH_SECRET")];

    try {
        const verified = jwt.verify(token, AUTH_SECRET);
        return [verified as TokenPayload, null];
    } catch (e) {
        return [null, e as Error]
    }
};
