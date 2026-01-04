import { useStore } from "@tanstack/react-store";

import { userStore } from "../Auth/authStore";
import { Button, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../../utils/trpc";
import { useEffect } from "react";

function UserInfo() {
    const user = useStore(userStore);

    const { refetch, error, data, isLoading } = useQuery(trpc.auth.logout.queryOptions(undefined));

    useEffect(() => {
        // TODO: notification
        console.log(error)
    }, [error]);

    useEffect(() => {
        console.log(data)
        if (data) userStore.setState(null)
    }, [data])

    if (user) return (
        <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>{user.email}</Typography>
            <Button onClick={() => refetch()} loading={isLoading}>Log out</Button>
        </Stack>
    )

    return <Typography>You are not logged in</Typography>
}

export default UserInfo;
