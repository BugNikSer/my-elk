import { Divider, IconButton, Stack } from "@mui/material";
import { Settings } from '@mui/icons-material';

import { Pop } from "../../components/Pop";
import ThemeSwitch from "./ThemeSwitch";
import UserInfo from "./UserInfo";

function InfoBlock() {
    return (
        <Pop
            trigger={<IconButton><Settings /></IconButton>}
            content={(
                <Stack direction="column" gap="8px">
                    <UserInfo />
                    <Divider />
                    <ThemeSwitch />
                </Stack>
            )}
            slotProps={{
                muiPopper: { placement: "left-end" },
                muiPaper: { sx: { padding: "16px" } }
            }}
        />
    )
}

export default InfoBlock;