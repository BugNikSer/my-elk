import { TRPCError } from "@trpc/server";

export const notAuthedError = new TRPCError({ message: "Not authenticated", code: "FORBIDDEN" });