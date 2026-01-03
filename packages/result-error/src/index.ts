import { TRPC_ERROR_CODE_KEY } from "@trpc/server";

export type ResultError<R extends any, E = Error> = [R, null] | [null, E];
export type AsyncResultError<R extends any, E = Error> = Promise<ResultError<R, E>>;

export type ServiceError = {
    error: Error;
    code: TRPC_ERROR_CODE_KEY;
};
