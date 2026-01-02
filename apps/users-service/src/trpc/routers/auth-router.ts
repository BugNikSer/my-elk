import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, publicProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";

const logger = areaLogger("auth-router");

export default router({
    check: publicProcedure.query(({ ctx: { accessToken, refreshToken } }) => {
        return { accessToken, refreshToken }
    }),

})