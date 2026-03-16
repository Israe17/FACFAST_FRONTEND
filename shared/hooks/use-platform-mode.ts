"use client";

import { useSession } from "./use-session";

export function usePlatformMode() {
  const session = useSession();

  return {
    isPlatformAdmin: session.isPlatformAdmin,
    isPlatformMode: session.isPlatformMode,
    isTenantContextMode: session.isTenantContextMode,
    isTenantMode: session.isTenantMode,
    mode: session.mode,
  };
}
