"use client";

import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import { useMemo } from "react";

import type { CursorResponse, CursorQueryParams } from "@/shared/lib/api-types";

type UseCursorQueryOptions<TItem> = {
  queryKey: QueryKey;
  queryFn: (params: CursorQueryParams) => Promise<CursorResponse<TItem>>;
  limit?: number;
  search?: string;
  sortOrder?: "ASC" | "DESC";
  enabled?: boolean;
};

/**
 * Hook for cursor-based (keyset) pagination using TanStack Query's useInfiniteQuery.
 *
 * Matches the backend CursorResponseDto: `{ data, next_cursor, has_more }`.
 *
 * Usage:
 * ```ts
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useCursorQuery({
 *   queryKey: salesKeys.cursor({ search }),
 *   queryFn: (params) => listSaleOrdersCursor(params),
 *   search: debouncedSearch,
 * });
 * ```
 */
export function useCursorQuery<TItem>({
  queryKey,
  queryFn,
  limit = 20,
  search,
  sortOrder,
  enabled = true,
}: UseCursorQueryOptions<TItem>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      queryFn({
        cursor: pageParam ?? undefined,
        limit,
        search: search || undefined,
        sort_order: sortOrder,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? (lastPage.next_cursor ?? undefined) : undefined,
    enabled,
  });

  const flatData = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );

  return {
    ...query,
    /** Flattened array of all items across all fetched pages. */
    data: flatData,
    /** Total number of items loaded so far. */
    totalLoaded: flatData.length,
  };
}
