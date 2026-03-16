"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { resolveAppLanguage } from "@/shared/i18n/language";
import { translate } from "@/shared/i18n/translator";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";

import {
  createPlatformBusinessOnboarding,
  getPlatformBusinessById,
  listPlatformBusinesses,
  listPlatformBusinessBranches,
} from "./api";
import type { PlatformBusinessOnboardingInput } from "./types";

export const platformBusinessesKeys = {
  all: ["platform-businesses"] as const,
  branches: (businessId: string) =>
    [...platformBusinessesKeys.all, "branches", businessId] as const,
  detail: (businessId: string) =>
    [...platformBusinessesKeys.all, "detail", businessId] as const,
  list: () => [...platformBusinessesKeys.all, "list"] as const,
};

export function usePlatformBusinessesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: platformBusinessesKeys.list(),
    queryFn: listPlatformBusinesses,
  });
}

export function usePlatformBusinessQuery(businessId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(businessId),
    queryKey: platformBusinessesKeys.detail(businessId),
    queryFn: () => getPlatformBusinessById(businessId),
  });
}

export function usePlatformBusinessBranchesQuery(businessId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(businessId),
    queryKey: platformBusinessesKeys.branches(businessId),
    queryFn: () => listPlatformBusinessBranches(businessId),
  });
}

export function useCreatePlatformBusinessOnboardingMutation() {
  const queryClient = useQueryClient();
  const { language, t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: PlatformBusinessOnboardingInput) =>
      createPlatformBusinessOnboarding(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: platformBusinessesKeys.list() });
      const successLanguage = resolveAppLanguage({
        businessLanguage: variables.business.language,
        sessionLanguage: language,
      });
      toast.success(translate(successLanguage, "platform.business_onboarding_success"));
    },
    onError: (error) => {
      presentBackendErrorToast(error, {
        fallbackMessage: t("platform.onboarding_error_fallback"),
      });
    },
  });
}
