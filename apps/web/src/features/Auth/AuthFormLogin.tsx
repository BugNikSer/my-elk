import { useMemo, useState } from "react";
import { useBoolean } from "usehooks-ts";
import { Button, Snackbar, TextField } from "@mui/material";
import { Check } from "@mui/icons-material";

import { userStore } from "./authStore";
import { parseTRPCError, trpcClient } from "../../utils/trpc";

function AuthFormLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loading = useBoolean(false);
    const [error, setError] = useState<string | null>(null);

    const isEmailValid = useMemo(() => /[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]+/.test(email), [email]);
    const isPasswordValid = useMemo(() => password.length > 2 ,[password]);

    const handleSubmit = async () => {
        loading.setTrue();
        await trpcClient.auth.login.query({ email, password })
            .then((data) => userStore.setState(data))
            .catch((err) => setError(parseTRPCError(err)));
        loading.setFalse();
    };

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
            <Snackbar
                open={Boolean(error)}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                message={error}
            />
            <Button
                onClick={handleSubmit}
                loading={loading.value}
                disabled={!(isEmailValid && isPasswordValid)}
                variant="contained"
            >
                Log in
            </Button>
        </>
    )
}

export default AuthFormLogin;
