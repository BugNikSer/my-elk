import { createRootRoute, Outlet } from '@tanstack/react-router';
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Stack } from '@mui/material';
import AuthWrapper from '../features/Auth/AuthWrapper';
import { Sidebar } from '../features';

const SIDEBAR_WIDTH = 58;

function RootLayout() {
    return (
        <>
            <Stack
                direction="row"
                width="100vw"
                height="100vh"
                overflow="hidden"
                alignItems="center"
                justifyContent="center"
            >
                <Sidebar width={SIDEBAR_WIDTH} />
                <Stack
                    direction="column"
                    width={`calc(100vw - ${SIDEBAR_WIDTH}px)`}
                    height="100vh"
                    overflow="hidden"
                >
                    <AuthWrapper>
                        <Outlet />
                    </AuthWrapper>
                </Stack>
            </Stack>
            {/* <TanStackRouterDevtools position='bottom-left' /> */}
        </>
    )
};

export const Route = createRootRoute({ component: RootLayout });
