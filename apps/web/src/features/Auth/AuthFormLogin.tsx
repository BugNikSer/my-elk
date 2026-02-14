import { Fragment, useCallback, useMemo, useState } from "react";
import { useBoolean } from "usehooks-ts";
import { Button, Snackbar, Stack, TextField } from "@mui/material";
import { Check } from "@mui/icons-material";

import { userStore } from "./authStore";
import { parseTRPCError, usersTrpcClient } from "../../utils/trpc";

function AuthFormLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loading = useBoolean(false);
    const [error, setError] = useState<string | null>(null);

    const isEmailValid = useMemo(() => /[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]+/.test(email), [email]);
    const isPasswordValid = useMemo(() => password.length > 2 ,[password]);
    const isFormValid = useMemo(() => isEmailValid && isPasswordValid, [isEmailValid, isPasswordValid]);

    const handleSubmit = useCallback(async () => {
        if (!isFormValid) return;
        loading.setTrue();
        await usersTrpcClient.auth.login.query({ email, password })
            .then((data) => userStore.setState(data))
            .catch((err) => setError(parseTRPCError(err)));
        loading.setFalse();
    }, [email, password, isFormValid]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    }, [handleSubmit]);

    return (
        <Stack direction="column" gap="16px" margin="16px" marginTop="24px" onKeyDown={handleKeyDown}>
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
                disabled={!isFormValid}
                variant="contained"
            >
                Log in
            </Button>
        </Stack>
    )
}

export default AuthFormLogin;
