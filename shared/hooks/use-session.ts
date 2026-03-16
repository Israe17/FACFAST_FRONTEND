"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { logout } from "@/features/auth/api";
import { sessionQueryOptions } from "@/features/auth/queries";
import {
  getOperationalBusinessId,
  isPlatformMode,
  isTenantContextMode,
  isTenantMode,
} from "@/features/auth/utils";
import { APP_ROUTES } from "@/shared/lib/routes";
import { clearAuthenticatedAppState } from "@/shared/lib/session-state";

export function useSession() {
  const query = useQuery(sessionQueryOptions());
  const user = query.data ?? null;

  return {
    ...query,
    activeBusinessId: getOperationalBusinessId(user),
    activeBusinessLanguage: user?.active_business_language ?? null,
    isAuthenticated: Boolean(user),
    isPlatformAdmin: Boolean(user?.is_platform_admin),
    isPlatformMode: isPlatformMode(user),
    isTenantContextMode: isTenantContextMode(user),
    isTenantMode: isTenantMode(user),
    mode: user?.mode ?? null,
    user,
    userType: user?.user_type ?? null,
  };
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await clearAuthenticatedAppState(queryClient);
      router.replace(APP_ROUTES.login);
    },
  });
}
