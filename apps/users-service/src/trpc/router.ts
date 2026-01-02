import { router } from "./trpc";
import authRouter from "./routers/auth-router";
import usersRouter from "./routers/users-router";

export const appRouter = router({
    users: usersRouter,
    auth: authRouter,
});

export type AppRouter = typeof appRouter;
