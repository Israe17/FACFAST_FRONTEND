"use client";

import { useCallback, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

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
  const [formError, setFormError] = useState<string | null>(null);

  const resetBackendFormErrors = useCallback(() => {
    form.clearErrors();
    setFormError(null);
  }, [form]);

  const handleBackendFormError = useCallback((
    error: unknown,
    options: UseBackendFormErrorsOptions<TFieldValues> = {},
  ) => {
    const mappedErrors = applyBackendErrorsToForm(error, form.setError, options);
    const presentation = resolveBackendFormErrorPresentation(error, {
      fallbackMessage: options.fallbackMessage,
      toastMode: options.toastMode,
    });

    setFormError(presentation.bannerMessage);

    if (presentation.toastMessage) {
      toast.error(presentation.toastMessage);
    }

    return {
      ...mappedErrors,
      ...presentation,
    };
  }, [form]);

  return {
    formError,
    handleBackendFormError,
    resetBackendFormErrors,
  };
}
