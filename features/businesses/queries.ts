"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { resolveAppLanguage } from "@/shared/i18n/language";
import { translate } from "@/shared/i18n/translator";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";

import { onboardBusiness, updateCurrentBusiness } from "./api";
import { businessesKeys } from "./keys";
import { getCurrentBusinessQueryOptions } from "./query-options";
import type { BusinessOnboardingInput, UpdateCurrentBusinessInput } from "./types";

export { businessesKeys } from "./keys";

export function useCurrentBusinessQuery(enabled = true) {
  return useQuery(getCurrentBusinessQueryOptions(enabled));
}

type MutationFeedbackOptions = {
  showErrorToast?: boolean;
};

export function useUpdateCurrentBusinessMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { language, t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: UpdateCurrentBusinessInput) => updateCurrentBusiness(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: businessesKeys.current() });
      const successLanguage = resolveAppLanguage({
        businessLanguage: variables.language,
        sessionLanguage: language,
      });
      toast.success(translate(successLanguage, "business.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("business.update_error_fallback"),
        });
      }
    },
  });
}

export function useBusinessOnboardingMutation() {
  const { language, t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: BusinessOnboardingInput) => onboardBusiness(payload),
    onSuccess: (_data, variables) => {
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
