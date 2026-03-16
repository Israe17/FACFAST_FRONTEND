"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getSession } from "@/features/auth/api";
import { sessionQueryKey } from "@/features/auth/queries";
import type { AuthUser } from "@/features/auth/types";
import { resolveAppLanguage } from "@/shared/i18n/language";
import { translate } from "@/shared/i18n/translator";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";
import { APP_ROUTES } from "@/shared/lib/routes";
import { resetOperationalQueries } from "@/shared/lib/session-state";

import { clearBusinessContext, enterBusinessContext } from "./api";
import type { EnterTenantContextPayload } from "./types";

async function refreshSession(queryClient: QueryClient) {
  const session = await getSession();
  queryClient.setQueryData(sessionQueryKey, session);
  return session;
}

function getOptimisticPlatformSession(session: AuthUser | null | undefined) {
  if (!session?.is_platform_admin) {
    return session ?? null;
  }

  return {
    ...session,
    acting_branch_id: null,
    acting_business_id: null,
    active_business_language: undefined,
    mode: "platform" as const,
  };
}

export function useEnterTenantContextMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { language, t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: EnterTenantContextPayload) => enterBusinessContext(payload),
    onSuccess: async () => {
      await resetOperationalQueries(queryClient);
      const session = await refreshSession(queryClient);
      const successLanguage = resolveAppLanguage({
        activeBusinessLanguage: session?.active_business_language ?? null,
        fallbackLanguage: language,
      });

      toast.success(translate(successLanguage, "platform.enter_tenant_success"));
      router.replace(APP_ROUTES.business);
    },
    onError: (error) => {
      presentBackendErrorToast(error, {
        fallbackMessage: t("platform.enter_tenant_error_fallback"),
      });
    },
  });
}

export function useClearTenantContextMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { language, t } = useAppTranslator();

  return useMutation({
    mutationFn: clearBusinessContext,
    onSuccess: async () => {
      const currentSession = queryClient.getQueryData<AuthUser | null>(sessionQueryKey);
      queryClient.setQueryData(sessionQueryKey, getOptimisticPlatformSession(currentSession));
      await resetOperationalQueries(queryClient);
      const session = await refreshSession(queryClient);
      const successLanguage = resolveAppLanguage({
        activeBusinessLanguage: session?.active_business_language ?? null,
        fallbackLanguage: language,
      });

      toast.success(translate(successLanguage, "platform.clear_tenant_success"));
      router.replace(APP_ROUTES.superadminEnterContext);
    },
    onError: (error) => {
      presentBackendErrorToast(error, {
        fallbackMessage: t("platform.clear_tenant_error_fallback"),
      });
    },
  });
}
