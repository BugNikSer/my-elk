import { useCallback, useMemo, useState } from "react";
import { Button, IconButton, Snackbar, Stack, TextField } from "@mui/material";
import { Check, VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";

import { userStore } from "./authStore";
import { parseTRPCError, usersTrpcClient } from "../../utils/trpc";
import { useBoolean } from "usehooks-ts";

function AuthFormSignup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    
    const loading = useBoolean(false);
    const [error, setError] = useState<string | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isEmailValid = useMemo(() => /[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]+/.test(email), [email]);
    const isPasswordValid = useMemo(() => password.length > 2 ,[password]);
    const isPasswordConfirmValid = useMemo(() => isPasswordValid && passwordConfirm === password,[passwordConfirm, password, isPasswordValid]);
    const isFormValid = useMemo(() => isEmailValid && isPasswordValid && isPasswordConfirmValid, [isEmailValid, isPasswordValid, isPasswordConfirmValid]);

    const handleSubmit = useCallback(async () => {
        if (!isFormValid) return;
        loading.setTrue();
        await usersTrpcClient.auth.signup.mutate({ email, password })
            .then((data) => userStore.setState(data))
            .catch(err => setError(parseTRPCError(err)));
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
                        endAdornment: isEmailValid && <Check color="success" />,
                    },
                }}
            />
            <TextField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                label="Password"
                slotProps={{
                    input: {
                        endAdornment: (
                            <Stack direction="row" alignItems="center">
                                {isPasswordValid && <Check color="success" />}
                                <IconButton
                                    onMouseDown={() => setShowPassword(true)}
                                    onMouseUp={() => setShowPassword(false)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                </IconButton>
                            </Stack>
                        ),
                    },
                }}
            />
            <TextField
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                type={showConfirmPassword ? "text" : "password"}
                label="Password"
                slotProps={{
                    input: {
                        endAdornment: (
                            <Stack direction="row" alignItems="center">
                                {isPasswordConfirmValid && <Check color="success" />}
                                <IconButton
                                    onMouseDown={() => setShowConfirmPassword(true)}
                                    onMouseUp={() => setShowConfirmPassword(false)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                </IconButton>
                            </Stack>
                        ),
                    },
                }}
            />
            <Button
                onClick={handleSubmit}
                loading={loading.value}
                disabled={!isFormValid}
                variant="contained"
            >
                Sign up
            </Button>
            <Snackbar
                open={Boolean(error)}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                message={error}
            />
        </Stack>
    )
}

export default AuthFormSignup;
