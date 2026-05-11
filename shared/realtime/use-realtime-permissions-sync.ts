"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { sessionQueryKey } from "@/features/auth/queries";
import { rolesKeys } from "@/features/roles/keys";

import { REALTIME_EVENTS } from "./realtime-events";
import { useRealtimeEvent } from "./use-realtime-event";

/**
 * Bridge realtime permission events into React Query's cache.
 *
 * - `permissions.changed` (per-user or tenant-wide) → invalidate the
 *   session query so `user.permissions` refetches and every consumer
 *   of `usePermissions()` sees the new set on the next render.
 * - `permissions.catalog_updated` → invalidate the catalog query so
 *   the dev-mode validation in `usePermissions()` doesn't false-warn
 *   on freshly-seeded keys.
 *
 * Mount this once near the auth root (the dashboard layout). It does
 * not render anything; the effect is purely cache invalidation.
 */
export function useRealtimePermissionsSync(): void {
  const queryClient = useQueryClient();

  const handlePermissionsChanged = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: sessionQueryKey });
  }, [queryClient]);

  const handleCatalogUpdated = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: rolesKeys.permissions() });
  }, [queryClient]);

  useRealtimeEvent(
    REALTIME_EVENTS.PERMISSIONS_CHANGED,
    handlePermissionsChanged,
  );
  useRealtimeEvent(
    REALTIME_EVENTS.PERMISSIONS_CATALOG_UPDATED,
    handleCatalogUpdated,
  );
}
