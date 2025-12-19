import '@tanstack/react-query';

interface GlobalQueryMeta extends Record<string, unknown> {
  revalidateCache?: boolean;
}

interface GlobalMutationMeta extends Record<string, unknown> {
  invalidates?: Array<QueryKey>;
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: GlobalQueryMeta;
    mutationMeta: GlobalMutationMeta;
  }
}
