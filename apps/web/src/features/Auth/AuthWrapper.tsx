import { useEffect, type PropsWithChildren } from "react";
import { useStore } from "@tanstack/react-store";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertTitle, CircularProgress, IconButton } from "@mui/material";
import { Refresh } from '@mui/icons-material';

import { userStore } from "./authStore";
import { usersTrpc } from "../../utils/trpc";
import AuthForm from "./AuthForm";

function AuthWrapper({ children } : PropsWithChildren) {
    const user = useStore(userStore);

    const { data, error, isLoading, refetch } = useQuery(usersTrpc.auth.check.queryOptions(undefined, {
        retry: (failureCount, err) => {
            if (err.data?.code === "UNAUTHORIZED") return false;
            if (failureCount > 2) return false;
            return true;
        }
    }));

    useEffect(() => {
        if (!user && data) {
            userStore.setState(data);
        }
    }, [user, data]);

    if (user) return children;
    if (isLoading) return (
            <CircularProgress sx={{ margin: "auto" }} />
    );
    if (error && error.data?.code !== "UNAUTHORIZED") {
        return (
            <Alert
                severity="error"
                sx={{ margin: "auto" }}
                action={
                    <IconButton color="inherit" onClick={() => refetch()} size="large">
                        <Refresh />
                    </IconButton>
                }
            >
                <AlertTitle>Auth failed</AlertTitle>
                {[error.message, error.data?.code].filter(Boolean).join(": ")}
            </Alert>
        )
    }
    return <AuthForm />
}

export default AuthWrapper;
