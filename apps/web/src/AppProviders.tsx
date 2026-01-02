import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import { elkTheme } from "./theme";
import App from "./App";

function AppProviders() {
  return (
    <ThemeProvider theme={elkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

export default AppProviders
