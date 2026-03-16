import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

function shouldRetry(failureCount: number, error: unknown) {
  const status = (error as AxiosError | undefined)?.response?.status;

  if (status && [400, 401, 403, 404].includes(status)) {
    return false;
  }

  return failureCount < 1;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return createQueryClient();
  }

  browserQueryClient ??= createQueryClient();

  return browserQueryClient;
}
