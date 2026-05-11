"use client";

import { useEffect } from "react";

import {
  type RealtimeEventName,
  type RealtimeEventPayloads,
} from "./realtime-events";
import { useRealtimeSocket } from "./realtime-provider";

/**
 * Subscribe to a single server-emitted event for the lifetime of the
 * caller component. The subscription is established as soon as the
 * socket is available and torn down on unmount or socket replacement.
 *
 * The handler is intentionally NOT memoized for the caller — pass a
 * stable callback (useCallback or a top-level function) if it captures
 * heavy state, otherwise the subscription rebinds on every render.
 *
 * The listener is cast at the boundary because Socket.io's typed
 * `EventNames` only knows about its built-ins; our custom contract
 * lives in `realtime-events.ts` and is the source of truth for the
 * payload shape.
 */
export function useRealtimeEvent<E extends RealtimeEventName>(
  event: E,
  handler: (payload: RealtimeEventPayloads[E]) => void,
): void {
  const socket = useRealtimeSocket();

  useEffect(() => {
    if (!socket) return;
    // Socket.io's typed listener API only knows its built-in events.
    // Our domain events live in REALTIME_EVENTS — bypass the narrow
    // typing at this single boundary; payload typing is preserved at
    // the call site via the generic above.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const eventName = event as any;
    const listener = handler as (...args: any[]) => void;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    socket.on(eventName, listener);
    return () => {
      socket.off(eventName, listener);
    };
  }, [socket, event, handler]);
}
