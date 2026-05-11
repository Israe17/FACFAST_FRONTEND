"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { io, type Socket } from "socket.io-client";

import { useSession } from "@/shared/hooks/use-session";

import { REALTIME_NAMESPACE } from "./realtime-events";

type RealtimeContextValue = {
  /** The active socket. `null` while unauthenticated or before first connect. */
  socket: Socket | null;
  /** Whether the socket has reported itself connected. Useful for UI status. */
  isConnected: boolean;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  socket: null,
  isConnected: false,
});

function resolveRealtimeUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_REALTIME_URL?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/**
 * Single Socket.io connection per authenticated session. Mounts in the
 * dashboard layout. The provider:
 *
 * - opens the socket as soon as `useSession()` reports a logged-in user
 * - reuses the same connection across the whole app via context
 * - reconnects automatically (Socket.io built-in) if the network drops
 * - tears down (and disposes the socket) on logout or user change so
 *   we never leak a stale connection between accounts
 *
 * The transport sends the existing httpOnly auth cookie via
 * `withCredentials: true`; the backend gateway re-validates it on the
 * upgrade handshake. There is no separate token to manage on the client.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user, activeBusinessId } = useSession();
  const userId = user?.id ?? null;
  // Platform admins switch tenants in-session via `acting_business_id`.
  // Re-key the effect on the effective business id so the socket
  // reconnects into the right tenant room on context switch — without
  // this, an admin who enters tenant B keeps receiving emits aimed at
  // tenant A's business room.
  const connectionKey = userId !== null ? `${userId}:${activeBusinessId ?? ""}` : null;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!connectionKey) {
      // Logged out (or still loading): make sure no stale socket lingers.
      // The cleanup function from the previous effect run handles that
      // already; this branch just makes the intent explicit.
      return;
    }

    const url = resolveRealtimeUrl();
    const nextSocket = io(`${url}${REALTIME_NAMESPACE}`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      // Reconnect with exponential-ish backoff. Socket.io defaults are
      // sane; we tighten the initial delay so a flaky connection
      // recovers quickly without hammering the server.
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 10_000,
    });

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);

    setSocket(nextSocket);

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
    // The connection is keyed off (user id, effective business id) so a
    // platform admin entering or leaving a tenant context triggers a
    // clean reconnect into the correct business room.
  }, [connectionKey]);

  const value = useMemo<RealtimeContextValue>(
    () => ({ socket, isConnected }),
    [socket, isConnected],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeSocket(): Socket | null {
  return useContext(RealtimeContext).socket;
}

export function useRealtimeConnectionStatus(): boolean {
  return useContext(RealtimeContext).isConnected;
}
