"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { CursorResponse } from "@/shared/lib/api-types";

import { useDebouncedValue } from "./use-debounced-value";
import {
  DEFAULT_PAGE_SIZE,
  type PageSize,
} from "@/shared/components/activity-list";

/**
 * State machine for a cursor-paginated activity list with debounced
 * search, page-size selector and prev/next navigation. Centralises the
 * 80-line block that used to live in every `*List` inside
 * UserActivityTab and ContactActivityTab — six near-identical copies
 * now share one source of truth.
 *
 * The returned shape is consumable directly by `<ActivityList>`; the
 * caller only writes the queryKey, queryFn and the per-row mapper.
 *
 * Design notes:
 *
 * - Pagination resets when filters / page size / search change. We
 *   detect that with a render-time setState pattern (the React-team
 *   sanctioned escape hatch for derived state), so consumers don't
 *   have to remember to wire useEffects themselves.
 *
 * - Cursor history is a stack of every cursor we've moved past, so
 *   prev/next is symmetric without re-fetching. TanStack Query caches
 *   each cursor as its own entry — going back is instant.
 *
 * - `enabled` flows straight to useQuery so the caller can gate the
 *   fetch on tab visibility, valid id, etc.
 */
export type UseActivityCursorListOptions<
  TItem extends { id: number | string },
  TFilters,
> = {
  /** Stable identity for the query (e.g. ["users", id, "activity", "sales"]). */
  baseQueryKey: readonly unknown[];
  /** Caller-supplied fetch. Receives the cursor + limit + debounced search. */
  queryFn: (params: {
    cursor: number | undefined;
    limit: number;
    search: string | undefined;
    filters: TFilters;
  }) => Promise<CursorResponse<TItem>>;
  /** Active filter object. Used in the queryKey and passed to queryFn. */
  filters: TFilters;
  /** Whether to actually fire the query (defaults to true). */
  enabled?: boolean;
  /** Initial page size; defaults to DEFAULT_PAGE_SIZE. */
  initialPageSize?: PageSize;
  /** Debounce window for the search input; defaults to 300ms. */
  searchDebounceMs?: number;
};

export type ActivityCursorListController<
  TItem extends { id: number | string },
> = {
  // List data
  rawItems: TItem[];
  total: number;
  // Query status
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  // Pagination
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  pageNumber: number;
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
  // Search
  search: string;
  onSearchChange: (value: string) => void;
};

export function useActivityCursorList<
  TItem extends { id: number | string },
  TFilters,
>({
  baseQueryKey,
  queryFn,
  filters,
  enabled = true,
  initialPageSize = DEFAULT_PAGE_SIZE,
  searchDebounceMs = 300,
}: UseActivityCursorListOptions<TItem, TFilters>): ActivityCursorListController<TItem> {
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), searchDebounceMs);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<(number | undefined)[]>([]);

  // Reset pagination whenever filters / search / page size change.
  // Render-time setState is React's sanctioned pattern for derived
  // state resets — the alternative useEffect approach would briefly
  // serve a stale page on every change.
  const filtersKey = JSON.stringify({ filters, search: debouncedSearch });
  const [lastFiltersKey, setLastFiltersKey] = useState(filtersKey);
  const [lastPageSize, setLastPageSize] = useState(pageSize);
  if (filtersKey !== lastFiltersKey || pageSize !== lastPageSize) {
    setLastFiltersKey(filtersKey);
    setLastPageSize(pageSize);
    setCursor(undefined);
    setCursorStack([]);
  }

  const query = useQuery({
    queryKey: [
      ...baseQueryKey,
      filters,
      pageSize,
      debouncedSearch,
      cursor,
    ],
    queryFn: () =>
      queryFn({
        cursor,
        limit: pageSize,
        search: debouncedSearch || undefined,
        filters,
      }),
    enabled,
  });

  const rawItems = query.data?.data ?? [];
  const total = query.data?.total ?? 0;
  const hasNextPage = Boolean(query.data?.has_more);
  const hasPrevPage = cursorStack.length > 0;
  const pageNumber = cursorStack.length + 1;

  function onNextPage() {
    const next = query.data?.next_cursor;
    if (hasNextPage && next != null) {
      setCursorStack((prev) => [...prev, cursor]);
      setCursor(next);
    }
  }

  function onPrevPage() {
    const prev = cursorStack[cursorStack.length - 1];
    setCursor(prev);
    setCursorStack((stack) => stack.slice(0, -1));
  }

  return {
    rawItems,
    total,
    isLoading: query.isLoading,
    isFetching: query.isFetching && !query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: () => query.refetch(),
    hasNextPage,
    hasPrevPage,
    onNextPage,
    onPrevPage,
    pageNumber,
    pageSize,
    onPageSizeChange: setPageSize,
    search: searchInput,
    onSearchChange: setSearchInput,
  };
}
