import { router } from "./trpc";
import categoriesRouter from "./routers/categories-router";
import kindsRouter from "./routers/kinds-router";
import tagsRouter from "./routers/tags-router";

export const appRouter = router({
    categories: categoriesRouter,
    kinds: kindsRouter,
    tags: tagsRouter,
});

export type AppRouter = typeof appRouter;
