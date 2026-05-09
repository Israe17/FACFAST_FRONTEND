"use client";

import { useEffect, useState } from "react";

/**
 * Returns the latest value but throttled — only updates after `delay`ms of
 * inactivity. Useful for keeping live form inputs cheap to render while
 * keeping the actual query (or any expensive consumer) from firing on
 * every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
