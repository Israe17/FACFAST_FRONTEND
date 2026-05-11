"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { listAvailablePermissions } from "@/features/roles/api";
import { rolesKeys } from "@/features/roles/keys";
import { CATALOG_STALE_TIME } from "@/shared/lib/query-config";

import { useSession } from "./use-session";

/**
 * Fetches and caches the system-wide permissions catalog. Lives in shared
 * because `usePermissions()` needs it to validate that `can()` inputs
 * reference real permissions — typos otherwise silently return false.
 *
 * Backed by `GET /permissions`, which is open to any authenticated user:
 * the catalog is metadata (knowing that "contacts.view" exists does not
 * grant it). Per-user authorization is still enforced by the backend on
 * every concrete operation.
 *
 * Reuses the same `rolesKeys.permissions()` queryKey already populated by
 * the roles management UI, so the data is shared across both consumers
 * without an extra network round-trip.
 */
export function useEnsurePermissionsCatalog() {
  const { isAuthenticated } = useSession();
  return useQuery({
    enabled: isAuthenticated,
    queryKey: rolesKeys.permissions(),
    queryFn: listAvailablePermissions,
    staleTime: CATALOG_STALE_TIME,
  });
}

/**
 * Returns the set of permission keys defined in the system, or `null`
 * while the catalog has not loaded yet (first paint, unauthenticated,
 * network in flight). Callers should treat `null` as "do not warn / do
 * not block" — the catalog is purely a developer-time validation aid.
 */
export function useKnownPermissionKeys(): Set<string> | null {
  const query = useEnsurePermissionsCatalog();
  return useMemo(() => {
    if (!query.data) return null;
    return new Set(query.data.map((permission) => permission.key));
  }, [query.data]);
}
