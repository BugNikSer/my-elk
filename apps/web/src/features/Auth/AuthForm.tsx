import { useState } from "react";
import { Paper, Stack, Tab, Tabs } from "@mui/material";

import AuthFormLogin from "./AuthFormLogin";
import AuthFormSignup from "./AuthFormSignup";

const modesDict = {
    login: {
        label: "Log in",
        fields: <AuthFormLogin />,
    },
    signup: {
        label: "Sign up",
        fields: <AuthFormSignup />,
    },
} as const;
type Mode = keyof typeof modesDict;

function AuthForm() {
    const [mode, setMode] = useState<Mode>(Object.keys(modesDict)[0] as Mode);

    return (
        <Paper sx={{ width: "500px", alignSelf: "center", margin: "auto 0" }}>
            <Tabs value={mode} onChange={(_, val) => setMode(val)}>
                {Object.entries(modesDict).map(([value, { label }]) => (
                    <Tab {...{ value, label }} key={value} />
                ))}
            </Tabs>

            {modesDict[mode].fields}
        </Paper>
    )
}

export default AuthForm;
