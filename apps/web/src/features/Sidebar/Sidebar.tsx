import { Stack } from "@mui/material"
import InfoBlock from "./InfoBlock";
import Moose from "../../components/icons/Moose";

function Sidebar() {
    return (
        <Stack
            sx={(theme) => ({
                direction: "column",
                width: "42px",
                height: "100%",
                overflow: "hidden",
                padding: "4px 0",
                backgroundColor: theme.palette.background.paper,
                borderRight: `2px solid ${theme.palette.divider}`,
            })}
            justifyContent="space-between"
        >
            <Stack direction="column" gap="4px">
                <Moose color="primary" sx={{ width: "1em", height: "1em", fontSize: "1.5rem", margin: "4px 8px" }} />
            </Stack>
            <Stack direction="column" gap="4px">
                <InfoBlock />
            </Stack>
            
        </Stack>
    )
};

export default Sidebar;
