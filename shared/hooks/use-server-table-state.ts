"use client";

import { useCallback, useRef, useState } from "react";

import type { ServerSideState } from "@/shared/components/data-table";

const DEFAULT_STATE: ServerSideState = {
  page: 1,
  limit: 20,
  search: "",
  sort_by: "",
  sort_order: "ASC",
};

/**
 * Manages server-side table state with debounced search.
 * Returns both the UI state (for the input) and the debounced query params (for the API call).
 */
export function useServerTableState(initial?: Partial<ServerSideState>) {
  const [state, setState] = useState<ServerSideState>({ ...DEFAULT_STATE, ...initial });
  const [debouncedSearch, setDebouncedSearch] = useState(state.search);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onStateChange = useCallback((next: ServerSideState) => {
    setState(next);
    // Debounce search changes
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(next.search);
    }, 400);
  }, []);

  const queryParams = {
    page: state.page,
    limit: state.limit,
    search: debouncedSearch || undefined,
    sort_by: state.sort_by || undefined,
    sort_order: state.sort_order,
  };

  return { serverState: state, onStateChange, queryParams };
}
