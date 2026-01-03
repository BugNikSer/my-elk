import { amber, brown } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

export const elkTheme = createTheme({
    colorSchemes: {
        dark: {
            palette: {
                mode: "dark",
                primary: brown,
                secondary: amber,
            },
        },
        light: {
            palette: {
                mode: "light",
                primary: brown,
                secondary: amber,
            }
        },
    },
});


