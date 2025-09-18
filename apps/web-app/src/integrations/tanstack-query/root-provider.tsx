import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function getContext() {
  const queryClient = new QueryClient();
  return {
    queryClient,
  };
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  return (
    // @ts-expect-error react-query types are broken
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
