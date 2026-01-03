import { Stack } from "@mui/material"
import ThemeSwitch from "./ThemeSwitch";

function Sidebar() {
    return (
        <Stack
            direction="column"
            width="40px"
        >
            <span>1</span>
            <span>2</span>
            <ThemeSwitch />
        </Stack>
    )
};

export default Sidebar;
