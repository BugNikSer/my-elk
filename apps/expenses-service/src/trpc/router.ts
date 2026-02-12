import { router } from "./trpc";
import categoriesRouter from "./routers/categories-router";
import kindsRouter from "./routers/kinds-router";
import tagsRouter from "./routers/tags-router";
import productsRouter from "./routers/products-router";
import purchasesRouter from "./routers/purchases-router";

export const appRouter = router({
    categories: categoriesRouter,
    kinds: kindsRouter,
    tags: tagsRouter,
    products: productsRouter,
    purchases: purchasesRouter,
});

export type AppRouter = typeof appRouter;
