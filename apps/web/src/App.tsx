import { Stack } from "@mui/material";
import AuthWrapper from "./features/Auth/AuthWrapper";
import { Sidebar } from "./features/Sidebar";

function App() {
    return (
        <Stack direction="row" width="100vw" height="100vh" overflow="hidden" alignItems="center" justifyContent="center">
            <Sidebar />

            <Stack direction="column" width="calc(100vw - 42px)" height="100vh" overflow="hidden">
                <AuthWrapper>
                    <span>authed!</span>
                </AuthWrapper>
            </Stack>
        </Stack>
    )
}

export default App;
