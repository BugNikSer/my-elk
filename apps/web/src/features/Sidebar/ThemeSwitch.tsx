import { useColorScheme } from '@mui/material/styles';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";

const themeModes = ["system", "light", "dark"] as const;

function ThemeSwitch() {
    const { mode, setMode } = useColorScheme();

    return (
        <FormControl>
            <FormLabel>Color theme</FormLabel>
            <RadioGroup
                value={mode}
                row
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
    )
};

export default ThemeSwitch;
