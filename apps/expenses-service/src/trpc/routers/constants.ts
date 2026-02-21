import z from "zod";
import { TRPCError } from "@trpc/server";

export const notAuthedError = new TRPCError({ message: "Not authenticated", code: "FORBIDDEN" });

export const defaultGetManyFilter = z.object({
    query: z.string().optional(),
    id: z.union([ z.number(), z.array(z.number()) ]).optional(),
}).optional();
export const defaultGetManyPagination = z.object({ page: z.number(), pageSize: z.number() }).optional();
export const defaultGetManySorting = z.object({ field: z.enum(["id", "name"]), order: z.enum(["ASC", "DESC"]) }).optional();

export const defaultGetManyInput = z.object({
    filter: defaultGetManyFilter,
    pagination: defaultGetManyPagination,
    sorting: defaultGetManySorting,
});
