"use client";

import type { ReactNode } from "react";

import { RealtimeProvider } from "./realtime-provider";
import { useRealtimePermissionsSync } from "./use-realtime-permissions-sync";

/**
 * Client-side wrapper that bundles the realtime provider with the
 * default sync behaviour (permissions + catalog invalidation). Mount
 * once near the auth root from a server component — server components
 * can't call hooks directly, so this exists to keep the layout file
 * server-rendered while the realtime layer stays client-only.
 *
 * Add more `useRealtime*Sync()` hooks here as we wire additional
 * cross-cutting events (notifications, dispatches, etc.) so consumers
 * never need to remember to mount them individually.
 */
export function RealtimeShell({ children }: { children: ReactNode }) {
  return (
    <RealtimeProvider>
      <RealtimeSyncBridge />
      {children}
    </RealtimeProvider>
  );
}

function RealtimeSyncBridge() {
  useRealtimePermissionsSync();
  return null;
}
