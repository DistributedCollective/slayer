import { TanStackDevtools } from '@tanstack/react-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import type { QueryClient } from '@tanstack/react-query';

import { Footer } from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import {
  ThemeProvider,
  useTheme,
  type Theme,
} from '@/components/theme-provider';
import { useEffect, type PropsWithChildren } from 'react';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: () => (localStorage.getItem('theme') || 'dark') as Theme,
  component: RootComponent,
});

function RootComponent() {
  const data = Route.useLoaderData();
  return (
    <ThemeProvider theme={data}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: PropsWithChildren) {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    if (theme === 'auto') {
      const isDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      document.documentElement.classList.add(isDarkMode ? 'dark' : 'light');
    } else {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  return (
    <>
      <HeadContent />
      <Header />
      <main className="relative z-0 overflow-x-hidden">{children}</main>
      <Footer />
      <TanStackDevtools
        config={{
          position: 'bottom-left',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          {
            name: 'Tanstack Query',
            render: <ReactQueryDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
