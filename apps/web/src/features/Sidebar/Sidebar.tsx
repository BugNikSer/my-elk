import { Link, useLocation } from "@tanstack/react-router";
import { IconButton, Stack, Tooltip } from "@mui/material"
import {
    CategoryOutlined,
    BookmarkBorderOutlined,
    LocalOfferOutlined,
    CardGiftcardOutlined,
    ShoppingCartOutlined,
} from "@mui/icons-material";

import InfoBlock from "./InfoBlock";
import Moose from "../../components/icons/Moose";

const pages = [
    { path: "/", Icon: Moose, label: "Home" },
    { path: "/purchases", Icon: ShoppingCartOutlined, label: "Purchases", },
    { path: "/products", Icon: CardGiftcardOutlined, label: "Products", },
    { path: "/categories", Icon: CategoryOutlined, label: "Categories", },
    { path: "/kinds", Icon: BookmarkBorderOutlined, label: "Kinds", },
    { path: "/tags", Icon: LocalOfferOutlined, label: "Tags", },
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
                {pages.map(({ path, Icon, label }) => (
                    <Link to={path}>
                        <Tooltip placement="right" title={label}>
                            <IconButton size="medium" color={path === pathname ? "primary" : undefined}>
                                <Icon />
                            </IconButton>
                        </Tooltip>
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
