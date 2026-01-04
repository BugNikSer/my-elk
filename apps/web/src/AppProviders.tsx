import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';

import { elkTheme } from "./utils/theme";
import { queryClient } from "./utils/trpc";
import App from "./App";

function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={elkTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default AppProviders
