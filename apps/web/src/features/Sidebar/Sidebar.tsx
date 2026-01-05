import { Link } from "@tanstack/react-router";
import { IconButton, Stack } from "@mui/material"
import { FormatListNumberedOutlined } from "@mui/icons-material";

import InfoBlock from "./InfoBlock";
import Moose from "../../components/icons/Moose";

function Sidebar({ width }: { width: number }) {
    return (
        <Stack
            sx={(theme) => ({
                direction: "column",
                alignItems: "center",
                width: `${width}px`,
                height: "100%",
                overflow: "hidden",
                padding: "12px 0",
                backgroundColor: theme.palette.background.paper,
                borderRight: `2px solid ${theme.palette.divider}`,
            })}
            justifyContent="space-between"
        >
            <Stack direction="column" gap="4px">
                <Link to="/">
                    <IconButton color="primary" size="medium">
                        <Moose />
                    </IconButton>
                </Link>

                <Link to="/list">
                    <IconButton size="medium">
                        <FormatListNumberedOutlined />
                    </IconButton>
                </Link>
            </Stack>
            <Stack direction="column" gap="4px">
                <InfoBlock />
            </Stack>
            
        </Stack>
    )
};

export default Sidebar;
