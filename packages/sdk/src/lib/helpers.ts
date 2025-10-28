import { DEFAULT_PAGE_LIMIT } from '../constants.js';
import { SdkPaginatedQuery } from '../types.js';

interface QueryParams extends SdkPaginatedQuery {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const buildQuery = (params: QueryParams = {}) => {
  return {
    ...params,
    limit: params.limit ?? DEFAULT_PAGE_LIMIT,
    cursor: params.cursor ?? undefined,
    search: params.search ?? undefined,
  };
};
