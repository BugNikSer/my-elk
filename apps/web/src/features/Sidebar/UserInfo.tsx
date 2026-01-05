import { useState } from "react";
import { useBoolean } from "usehooks-ts";
import { useStore } from "@tanstack/react-store";
import { Button, Snackbar, Stack, Typography } from "@mui/material";

import { userStore } from "../Auth/authStore";
import { parseTRPCError, trpcClient } from "../../utils/trpc";

function UserInfo() {
    const user = useStore(userStore);

    const loading = useBoolean(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        loading.setTrue();
        await trpcClient.auth.logout.query()
            .then(() => userStore.setState(null))
            .catch(err => setError(parseTRPCError(err)));
        loading.setFalse();
    }

    if (user) return (
        <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>{user.email}</Typography>
            <Button onClick={handleLogout} loading={loading.value}>Log out</Button>
            <Snackbar
                open={Boolean(error)}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                message={error}
            />
        </Stack>
    )

    return <Typography>You are not logged in</Typography>
}

export default UserInfo;
