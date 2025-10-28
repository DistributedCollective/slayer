export interface SdkResponse<T> {
  data: T;
}

export interface SdkPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  count: number;
}

export interface SdkPaginatedQuery {
  limit?: number;
  cursor?: string;
  search?: string;
}
