import { z } from "zod";

import { authedProcedure } from "../trpc";
import { areaLogger } from "../../utils/logger";

const logger = areaLogger("categories-router");

export default {
    create: authedProcedure
        .input(z.object({ name: z.string() }))
        .mutation(({ input }) => {
            logger.debug("[create]", input);
            console.log(input);
        })
};
