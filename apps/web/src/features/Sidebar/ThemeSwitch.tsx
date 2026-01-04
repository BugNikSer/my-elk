import { useMemo } from 'react';
import { useColorScheme } from '@mui/material/styles';
import { FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup, Stack } from "@mui/material";
import { Brightness6 } from '@mui/icons-material';
import { Pop } from '../../components/Pop';

const themeModes = ["system", "light", "dark"] as const;

function ThemeSwitch() {
    const { mode, setMode } = useColorScheme();

    const content = useMemo(() => {
        if (!mode) return <>no color mode</>;
        return (
            <Stack direction="column">
                <FormControl>
                    <FormLabel>Color theme</FormLabel>
                    <RadioGroup
                        value={mode}
                        onChange={(event) =>
                            setMode(event.target.value as (typeof themeModes)[number])
                        }
                    >
                        {themeModes.map((themeMode) => (
                            <FormControlLabel
                                key={themeMode}
                                value={themeMode}
                                control={<Radio />}
                                label={themeMode}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </Stack>
        )
    }, [mode, setMode])

    return (
        <Pop
            trigger={<IconButton><Brightness6 /></IconButton>}
            content={content}
            slotProps={{
                muiPopper: { placement: "left-end" },
                muiPaper: { sx: { padding: "16px" } }
            }}
        />
    )
};

export default ThemeSwitch;
