"use client";

import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { useActiveBusiness } from "@/shared/hooks/use-active-business";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";

import { inventoryViewPermissions } from "./constants";

export function useInventoryModule() {
  const { canAny } = usePermissions();
  const { isTenantContextMode, isTenantMode, mode } = usePlatformMode();
  const business = useActiveBusiness();
  const branch = useActiveBranch();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const hasAnyInventoryAccess = canAny([...inventoryViewPermissions]);

  return {
    activeBranchId: branch.activeBranchId,
    activeBusinessId: business.activeBusinessId,
    activeBusinessName: business.activeBusinessName,
    canRunTenantQueries,
    hasAnyInventoryAccess,
    isBusinessLevelContext: branch.isBusinessLevelContext,
    isTenantContextMode,
    isTenantMode,
    mode,
  };
}
