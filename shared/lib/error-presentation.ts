import { toast } from "sonner";

import { type BackendError, isUnexpectedBackendError } from "./api-error";
import { parseBackendError } from "./backend-error-parser";

export type BackendErrorToastMode = "always" | "never" | "unexpected";

export type ResolveBackendFormErrorPresentationOptions = {
  fallbackMessage?: string;
  toastMode?: BackendErrorToastMode;
};

export type BackendFormErrorPresentation = {
  backendError: BackendError | null;
  bannerMessage: string | null;
  toastMessage: string | null;
};

function resolveBannerMessage(
  backendError: BackendError | null,
) {
  if (!backendError) {
    return null;
  }

  // The backend is the canonical source of human-readable error text.
  // Form banners should therefore reflect response.message directly,
  // while translated detail messages are reserved for field-level errors.
  return backendError.message;
}

function resolveToastMessage(
  backendError: BackendError | null,
  toastMode: BackendErrorToastMode,
) {
  if (!backendError || toastMode === "never") {
    return null;
  }

  if (toastMode === "always") {
    return backendError.message;
  }

  return isUnexpectedBackendError(backendError) ? backendError.message : null;
}

export function resolveBackendFormErrorPresentation(
  error: unknown,
  options: ResolveBackendFormErrorPresentationOptions = {},
): BackendFormErrorPresentation {
  const backendError = parseBackendError(error, options.fallbackMessage);
  const toastMode = options.toastMode ?? "unexpected";

  return {
    backendError,
    bannerMessage: resolveBannerMessage(backendError),
    toastMessage: resolveToastMessage(backendError, toastMode),
  };
}

export function presentBackendErrorToast(
  error: unknown,
  options: {
    fallbackMessage?: string;
    toastMode?: BackendErrorToastMode;
  } = {},
) {
  const presentation = resolveBackendFormErrorPresentation(error, {
    fallbackMessage: options.fallbackMessage,
    toastMode: options.toastMode ?? "always",
  });

  if (presentation.toastMessage) {
    toast.error(presentation.toastMessage);
  }

  return presentation.toastMessage;
}
