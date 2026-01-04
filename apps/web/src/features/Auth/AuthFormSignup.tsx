import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, IconButton, Stack, TextField } from "@mui/material";
import { Check, VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";

import { userStore } from "./authStore";
import { trpc } from "../../utils/trpc";

function AuthFormSignup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isEmailValid = useMemo(() => /[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]+/.test(email), [email]);
    const isPasswordValid = useMemo(() => password.length > 2 ,[password]);
    const isPasswordConfirmValid = useMemo(() => isPasswordValid && passwordConfirm === password,[passwordConfirm, password, isPasswordValid])

    const { mutate, error, isPending } = useMutation(trpc.auth.signup.mutationOptions({
        onSuccess: (data) => {
            userStore.setState(data)
        }
    }))
    const signup = () => mutate({ email, password });

    return (
        <>
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
                                <IconButton onMouseDown={() => setShowPassword(true)} onMouseUp={() => setShowPassword(false)}>
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
                                <IconButton onMouseDown={() => setShowConfirmPassword(true)} onMouseUp={() => setShowConfirmPassword(false)}>
                                    {showConfirmPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                </IconButton>
                            </Stack>
                        ),
                    },
                }}
            />
            {Boolean(error) && (
                <Alert
                    severity="error"
                    title="Sign up failed"
                >
                    {[error?.message, error?.data?.code].filter(Boolean).join(": ")}    
                </Alert>
            )}
            <Button
                onClick={signup}
                loading={isPending}
                disabled={!(isEmailValid && isPasswordValid)}
                variant="contained"
            >
                Sign up
            </Button>
        </>
    )
}

export default AuthFormSignup;
