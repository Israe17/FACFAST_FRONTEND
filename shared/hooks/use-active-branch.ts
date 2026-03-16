"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useSession } from "@/shared/hooks/use-session";
import { useTenantContext } from "@/shared/hooks/use-tenant-context";

const DEFAULT_ACTIVE_BRANCH_STORAGE_KEY = "facfast.activeBranchId";
const EMPTY_BRANCH_IDS: string[] = [];

const snapshots = new Map<string, string | null | undefined>();
const listenersByKey = new Map<string, Set<() => void>>();

function notify(storageKey: string) {
  listenersByKey.get(storageKey)?.forEach((listener) => listener());
}

function readStoredBranchId(storageKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(storageKey);
}

function persistBranchId(storageKey: string, branchId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (branchId) {
    window.localStorage.setItem(storageKey, branchId);
    return;
  }

  window.localStorage.removeItem(storageKey);
}

function getSnapshot(storageKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  if (!snapshots.has(storageKey)) {
    snapshots.set(storageKey, readStoredBranchId(storageKey));
  }

  return snapshots.get(storageKey) ?? null;
}

function setSnapshot(storageKey: string, branchId: string | null) {
  snapshots.set(storageKey, branchId);
  persistBranchId(storageKey, branchId);
  notify(storageKey);
}

function subscribe(storageKey: string, listener: () => void) {
  const listeners = listenersByKey.get(storageKey) ?? new Set<() => void>();
  listeners.add(listener);
  listenersByKey.set(storageKey, listeners);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== storageKey) {
      return;
    }

    snapshots.set(storageKey, event.newValue);
    listener();
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getValidBranchId(storedBranchId: string | null, branchIds: string[]) {
  if (!branchIds.length) {
    return null;
  }

  if (storedBranchId && branchIds.includes(storedBranchId)) {
    return storedBranchId;
  }

  return branchIds[0] ?? null;
}

function getAvailableBranchIds({
  actingBranchId,
  isLockedTenantContext,
  optionBranchIds,
  sessionBranchIds,
}: {
  actingBranchId?: string | null;
  isLockedTenantContext: boolean;
  optionBranchIds?: string[];
  sessionBranchIds?: string[];
}) {
  if (isLockedTenantContext) {
    return actingBranchId ? [actingBranchId] : EMPTY_BRANCH_IDS;
  }

  return optionBranchIds ?? sessionBranchIds ?? EMPTY_BRANCH_IDS;
}

type UseActiveBranchOptions = {
  availableBranchIds?: string[];
  enabled?: boolean;
  storageKey?: string;
};

export function useActiveBranch(options?: UseActiveBranchOptions) {
  const { user } = useSession();
  const tenantContext = useTenantContext();
  const storageKey = options?.storageKey ?? DEFAULT_ACTIVE_BRANCH_STORAGE_KEY;
  const enabled = options?.enabled ?? true;
  const isLockedTenantContext = tenantContext.isPlatformAdmin && tenantContext.isTenantContextMode;
  const availableBranchIds = getAvailableBranchIds({
    actingBranchId: user?.acting_branch_id,
    isLockedTenantContext,
    optionBranchIds: options?.availableBranchIds,
    sessionBranchIds: user?.branch_ids,
  });
  const storedBranchId = useSyncExternalStore(
    (listener) => subscribe(storageKey, listener),
    () => getSnapshot(storageKey),
    () => null,
  );
  const activeBranchId = isLockedTenantContext
    ? user?.acting_branch_id ?? null
    : enabled
      ? getValidBranchId(storedBranchId, availableBranchIds)
      : null;

  useEffect(() => {
    if (isLockedTenantContext) {
      return;
    }

    const nextAvailableBranchIds = getAvailableBranchIds({
      actingBranchId: user?.acting_branch_id,
      isLockedTenantContext,
      optionBranchIds: options?.availableBranchIds,
      sessionBranchIds: user?.branch_ids,
    });
    const nextBranchId = enabled
      ? getValidBranchId(getSnapshot(storageKey), nextAvailableBranchIds)
      : null;

    if (nextBranchId !== getSnapshot(storageKey)) {
      setSnapshot(storageKey, nextBranchId);
    }
  }, [
    enabled,
    isLockedTenantContext,
    options?.availableBranchIds,
    storageKey,
    user?.acting_branch_id,
    user?.branch_ids,
  ]);

  return {
    activeBranchId,
    availableBranchIds: enabled ? availableBranchIds : EMPTY_BRANCH_IDS,
    canSwitchBranchContext: !isLockedTenantContext,
    hasBranches: enabled && availableBranchIds.length > 0,
    isBusinessLevelContext: isLockedTenantContext && !user?.acting_branch_id,
    isLockedTenantContext,
    setActiveBranchId: (branchId: string) => {
      if (isLockedTenantContext || !enabled || !availableBranchIds.includes(branchId)) {
        return false;
      }

      setSnapshot(storageKey, branchId);
      return true;
    },
  };
}
