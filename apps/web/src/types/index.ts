import type { TRPCClientErrorLike } from "@trpc/client";
import type { DefaultErrorShape } from "@trpc/server/unstable-core-do-not-import";

export type DefaultTRPCClientError = TRPCClientErrorLike<{ errorShape: DefaultErrorShape; transformer: false }>;
