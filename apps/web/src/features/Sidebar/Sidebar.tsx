import { Link, useLocation } from "@tanstack/react-router";
import { IconButton, Stack } from "@mui/material"
import { FormatListNumberedOutlined } from "@mui/icons-material";

import InfoBlock from "./InfoBlock";
import Moose from "../../components/icons/Moose";

const pages = [
    { path: "/", Icon: Moose },
    { path: "/list", Icon: FormatListNumberedOutlined },
] as const;

function Sidebar({ width }: { width: number }) {
    const { pathname } = useLocation();
    
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
                borderRight: 2,
                borderColor: "divider",
            })}
            justifyContent="space-between"
        >
            <Stack direction="column" gap="4px">
                {pages.map(({ path, Icon }) => (
                    <Link to={path}>
                        <IconButton size="medium" color={path === pathname ? "primary" : undefined}>
                            <Icon />
                        </IconButton>
                    </Link>
                ))}
            </Stack>
            <Stack direction="column" gap="4px">
                <InfoBlock />
            </Stack>
            
        </Stack>
    )
};

export default Sidebar;
