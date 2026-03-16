import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

import type { BackendError } from "./api-error";
import { getBackendFieldErrors, parseBackendError } from "./backend-error-parser";

export type BackendFieldNameMap<TFieldValues extends FieldValues> = Partial<
  Record<string, FieldPath<TFieldValues>>
>;

export type ApplyBackendErrorsToFormOptions<TFieldValues extends FieldValues> = {
  fallbackMessage?: string;
  fieldNameMap?: BackendFieldNameMap<TFieldValues>;
};

export type ApplyBackendErrorsToFormResult = {
  appliedFieldErrors: string[];
  backendError: BackendError | null;
  hasFieldErrors: boolean;
};

function resolveFieldName<TFieldValues extends FieldValues>(
  field: string,
  fieldNameMap?: BackendFieldNameMap<TFieldValues>,
) {
  return (fieldNameMap?.[field] ?? field) as FieldPath<TFieldValues>;
}

export function applyBackendErrorsToForm<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  options: ApplyBackendErrorsToFormOptions<TFieldValues> = {},
): ApplyBackendErrorsToFormResult {
  const backendError = parseBackendError(error, options.fallbackMessage);
  const fieldErrors = getBackendFieldErrors(error);
  const appliedFieldErrors = new Set<string>();

  fieldErrors.forEach((fieldError) => {
    const fieldName = resolveFieldName(fieldError.field, options.fieldNameMap);

    if (appliedFieldErrors.has(String(fieldName))) {
      return;
    }

    setError(fieldName, {
      message: fieldError.message,
      type: "server",
    });
    appliedFieldErrors.add(String(fieldName));
  });

  return {
    appliedFieldErrors: Array.from(appliedFieldErrors),
    backendError,
    hasFieldErrors: appliedFieldErrors.size > 0,
  };
}
