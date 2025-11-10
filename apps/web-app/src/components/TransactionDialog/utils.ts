export function handleErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.cause) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cause: any = error.cause;
      return (
        cause.details?.detail ??
        cause.details ??
        cause.shortMessage ??
        error.message ??
        'An unknown error occurred'
      );
    }
    return error.message || 'An unknown error occurred';
  }
  return 'An unknown error occurred';
}
