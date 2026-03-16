"use client";

import { hasTenantOperationalAccess } from "@/features/auth/utils";
import { useCurrentBusinessQuery } from "@/features/businesses/queries";

import { useSession } from "./use-session";

export function useActiveBusiness() {
  const session = useSession();
  const currentBusinessQuery = useCurrentBusinessQuery(
    hasTenantOperationalAccess(session.user) && Boolean(session.activeBusinessId),
  );

  return {
    activeBusinessId: session.activeBusinessId,
    activeBusinessName: currentBusinessQuery.data?.name ?? session.activeBusinessId ?? null,
    actingBusinessId: session.user?.acting_business_id ?? null,
    isLoadingActiveBusiness: currentBusinessQuery.isLoading,
    isPlatformAdmin: session.isPlatformAdmin,
    isPlatformMode: session.isPlatformMode,
    isTenantContextMode: session.isTenantContextMode,
    sessionBusinessId: session.user?.business_id ?? null,
  };
}
