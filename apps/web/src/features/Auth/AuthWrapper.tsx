import { useEffect, type PropsWithChildren } from "react";
import { useStore } from "@tanstack/react-store";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertTitle, CircularProgress } from "@mui/material";

import { userStore } from "./authStore";
import { trpc } from "../../utils/trpc";
import AuthForm from "./AuthForm";

function AuthWrapper({ children } : PropsWithChildren) {
    const user = useStore(userStore);

    const { data, error, isLoading } = useQuery(trpc.auth.check.queryOptions(undefined, { retry: false }));

    useEffect(() => {
        if (!user && data) {
            userStore.setState(data);
        }
    }, [user, data]);

    if (user) return children;
    if (isLoading) return <CircularProgress />; // TODO: maybe isLoading || data
    if (error && error.data?.code !== "UNAUTHORIZED") {
        return (
            <Alert severity="error">
                <AlertTitle>Auth failed</AlertTitle>
                {[error.message, error.data?.code].filter(Boolean).join(": ")}
            </Alert>
        )
    }
    return <AuthForm />
}

export default AuthWrapper;
