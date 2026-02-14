import { type ReactNode } from "react";
import { Stack, Typography } from "@mui/material";

export default function PageHeader ({
    title,
    actions,
}: {
    title: string;
    actions?: ReactNode;
}) {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ p: 1 }}
        >
            <Typography variant="h5">{title}</Typography>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
            >
                {actions}
            </Stack>
        </Stack>
    )
};
