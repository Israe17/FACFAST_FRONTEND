"use client";

import { useSession } from "./use-session";

export function useTenantContext() {
  const session = useSession();

  return {
    actingBranchId: session.user?.acting_branch_id ?? null,
    actingBusinessId: session.user?.acting_business_id ?? null,
    activeBranchId: session.user?.acting_branch_id ?? null,
    activeBusinessId: session.activeBusinessId,
    canClearTenantContext: session.isPlatformAdmin && session.isTenantContextMode,
    canEnterTenantContext: session.isPlatformAdmin && session.isPlatformMode,
    isBusinessLevelContext:
      session.isPlatformAdmin && session.isTenantContextMode && !session.user?.acting_branch_id,
    isPlatformAdmin: session.isPlatformAdmin,
    isPlatformMode: session.isPlatformMode,
    isTenantContextMode: session.isTenantContextMode,
    isTenantMode: session.isTenantMode,
    mode: session.mode,
    sessionBusinessId: session.user?.business_id ?? null,
  };
}
