import { HttpClient } from '@sovryn/slayer-shared';
import { DocumentNode, print } from 'graphql';

type GraphRequest = {
  query: string;
  variables: Record<string, unknown>;
};

export async function queryFromSubgraph<T = unknown>(
  url: string,
  query: DocumentNode,
  variables: GraphRequest['variables'] = {},
  signal?: AbortSignal,
): Promise<T> {
  const body: GraphRequest = {
    query: print(query),
    variables,
  };

  const response = await new HttpClient({ baseUrl: url }).request<{ data: T }>(
    '/',
    {
      method: 'POST',
      body,
      signal,
    },
  );

  return response.data;
}
