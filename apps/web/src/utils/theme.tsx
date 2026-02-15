import { orange, purple } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

export const elkTheme = createTheme({
    colorSchemes: {
        dark: {
            palette: {
                mode: "dark",
                primary: orange,
                secondary: purple,
                background: {
                    default: "#282828",
                    paper: "#2b2b2b",
                }
            },
        },
        light: {
            palette: {
                mode: "light",
                primary: orange,
                secondary: purple,
                background: {
                    default: "#fafafa",
                    paper: "#ffffff",
                }
            },
        },
    },
    components: {
        MuiRadio: { defaultProps: { size: "small" } },
        MuiInput: { defaultProps: { size: "small" } },
        MuiTextField: { defaultProps: { size: "small" } },
        MuiButton: { defaultProps: { size: "small" } },
        MuiIconButton: { defaultProps: { size: "small" } },
        MuiTableCell: { defaultProps: { size: "small" } },
    },
    shape: {
        borderRadius: 12,
    }
});


