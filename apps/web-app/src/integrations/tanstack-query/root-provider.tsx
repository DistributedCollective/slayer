import {
  matchQuery,
  MutationCache,
  QueryClient,
  QueryClientProvider,
  type QueryKey,
} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          // invalidate all matching tags at once
          // or everything if no meta is provided
          mutation.meta?.invalidates?.some((queryKey) =>
            matchQuery({ queryKey, exact: false }, query),
          ) ?? false,
      });
    },
  }),
});

export function getContext() {
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const runtimeMeta = new Map<string, boolean>();
const k = (queryKey: unknown) => JSON.stringify(queryKey);

export function shouldRevalidateQuery(queryKey: QueryKey) {
  const value = runtimeMeta.get(k(queryKey));
  if (value) {
    runtimeMeta.delete(k(queryKey));
    return { revalidateCache: true };
  }
  return {};
}

export function revalidateQuery({
  queryKey,
  exact = true,
}: {
  queryKey: QueryKey;
  exact?: boolean;
}) {
  runtimeMeta.set(k(queryKey), true);
  queryClient.invalidateQueries({ queryKey, exact });
}
