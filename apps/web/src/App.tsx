import { StrictMode } from 'react';
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { elkTheme } from "./utils/theme";
import { queryClient } from "./utils/trpc";
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function AppProviders() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={elkTheme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

export default AppProviders
