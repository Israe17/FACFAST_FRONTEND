import { queryOptions } from "@tanstack/react-query";

import { getSession } from "./api";

export const sessionQueryKey = ["auth", "session"] as const;

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: sessionQueryKey,
    queryFn: getSession,
    retry: false,
  });
}
