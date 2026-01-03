import { useMemo, useState } from "react";
import { Paper, Stack, Tab, Tabs, TextField } from "@mui/material";
import { Check } from '@mui/icons-material';

const modesDict = {
    login: "Log in",
    register: "Register",
} as const;
type Mode = keyof typeof modesDict;

function AuthForm() {
    const [mode, setMode] = useState<Mode>(Object.keys(modesDict)[0] as Mode);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const isEmailValid = useMemo(() => /[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]+/.test(email), [email]);
    const isPasswordValid = useMemo(() => password.length > 3 ,[password])
    const isPasswordConfirmValid = useMemo(() => passwordConfirm === password,[passwordConfirm, password])

    return (
        <Paper sx={{ width: "500px", alignSelf: "center", margin: "auto 0" }}>
            <Tabs value={mode} onChange={(_, val) => setMode(val)}>
                {Object.entries(modesDict).map(([value, label]) => (
                    <Tab {...{ value, label }} key={value} />
                ))}
            </Tabs>

            <Stack direction="column" gap="16px" margin="16px" marginTop="24px">
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
                />
            </Stack>
        </Paper>
    )
}

export default AuthForm;
