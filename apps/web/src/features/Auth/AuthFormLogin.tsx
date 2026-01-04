import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, TextField } from "@mui/material";
import { Check } from "@mui/icons-material";

import { userStore } from "./authStore";
import { trpc } from "../../utils/trpc";

function AuthFormLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const isEmailValid = useMemo(() => /[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]+/.test(email), [email]);
    const isPasswordValid = useMemo(() => password.length > 2 ,[password]);

    const { data, error, isLoading, refetch } = useQuery(trpc.auth.login.queryOptions({ email, password }, { enabled: false }));

    useEffect(() => {
        if (data) userStore.setState(data)
    }, [data])

    return (
        <>
            <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Email"
                slotProps={{
                    input: {
                        endAdornment: isEmailValid && <Check color="success" />
                    }
                }}
            />
            <TextField
                value={password}
                onChange={(e) => setPassword(e.target.value)} type="password"
                label="Password"
                slotProps={{
                    input: {
                        endAdornment: isPasswordValid && <Check color="success" />
                    }
                }}
            />
            {Boolean(error) && (
                <Alert
                    severity="error"
                    title="Log in failed"
                >
                    {[error?.message, error?.data?.code].filter(Boolean).join(": ")}    
                </Alert>
            )}
            <Button
                onClick={() => refetch()}
                loading={isLoading}
                disabled={!(isEmailValid && isPasswordValid)}
                variant="contained"
            >
                Log in
            </Button>
        </>
    )
}

export default AuthFormLogin;
