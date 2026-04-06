"use client";

import { useCallback, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import {
  applyBackendErrorsToForm,
  type ApplyBackendErrorsToFormOptions,
} from "@/shared/lib/form-error-mapper";
import {
  resolveBackendFormErrorPresentation,
  type BackendErrorToastMode,
} from "@/shared/lib/error-presentation";

type UseBackendFormErrorsOptions<TFieldValues extends FieldValues> =
  ApplyBackendErrorsToFormOptions<TFieldValues> & {
    toastMode?: BackendErrorToastMode;
  };

export function useBackendFormErrors<TFieldValues extends FieldValues>(
  form: Pick<UseFormReturn<TFieldValues>, "clearErrors" | "setError">,
) {
  const { t } = useAppTranslator();
  const [formError, setFormError] = useState<string | null>(null);

  const resetBackendFormErrors = useCallback(() => {
    form.clearErrors();
    setFormError(null);
  }, [form]);

  const handleBackendFormError = useCallback((
    error: unknown,
    options: UseBackendFormErrorsOptions<TFieldValues> = {},
  ) => {
    const mappedErrors = applyBackendErrorsToForm(error, form.setError, {
      ...options,
      translateMessage: t,
    });
    const presentation = resolveBackendFormErrorPresentation(error, {
      fallbackMessage: options.fallbackMessage,
      translateMessage: t,
      toastMode: options.toastMode,
    });

    // Suppress the banner when all errors are already shown on their fields.
    // The field-level messages are more precise and contextual; the banner
    // would just repeat the same information in a less user-friendly format
    // (e.g. showing raw DB field names for unique constraint violations).
    setFormError(mappedErrors.hasFieldErrors ? null : presentation.bannerMessage);

    if (presentation.toastMessage) {
      toast.error(presentation.toastMessage);
    }

    return {
      ...mappedErrors,
      ...presentation,
    };
  }, [form, t]);

  return {
    formError,
    handleBackendFormError,
    resetBackendFormErrors,
  };
}
