import { toast } from "sonner";

import { translate, type TranslationValues } from "@/shared/i18n/translator";
import type { FrontendTranslationKey } from "@/shared/i18n/translations";

import { type BackendError, isUnexpectedBackendError } from "./api-error";
import { getBackendErrorMessage, parseBackendError } from "./backend-error-parser";

export type BackendErrorToastMode = "always" | "never" | "unexpected";
type BackendErrorTranslator = (
  key: FrontendTranslationKey,
  values?: TranslationValues,
) => string;

export type ResolveBackendFormErrorPresentationOptions = {
  fallbackMessage?: string;
  translateMessage?: BackendErrorTranslator;
  toastMode?: BackendErrorToastMode;
};

export type BackendFormErrorPresentation = {
  backendError: BackendError | null;
  bannerMessage: string | null;
  toastMessage: string | null;
};

function getTranslator(translateMessage?: BackendErrorTranslator) {
  return translateMessage ?? ((key, values) => translate("es", key, values));
}

export function resolveTranslatedBackendMessage(
  backendError: Pick<BackendError, "code" | "message" | "messageKey"> | null,
  options: {
    fallbackMessage?: string;
    translateMessage?: BackendErrorTranslator;
  } = {},
) {
  if (!backendError) {
    return options.fallbackMessage ?? null;
  }

  const translator = getTranslator(options.translateMessage);
  const candidateKeys = [
    backendError.messageKey,
    `error.${backendError.code}`,
    `inventory.error.${backendError.code}`,
    `contacts.error.${backendError.code}`,
    `branches.error.${backendError.code}`,
    `users.error.${backendError.code}`,
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidateKeys) {
    const translated = translator(candidate as FrontendTranslationKey);

    if (translated !== candidate) {
      return translated;
    }
  }

  return options.fallbackMessage ?? backendError.message;
}

function resolveBannerMessage(
  backendError: BackendError | null,
  options: ResolveBackendFormErrorPresentationOptions,
) {
  if (!backendError) {
    return null;
  }

  return resolveTranslatedBackendMessage(backendError, options);
}

function resolveToastMessage(
  backendError: BackendError | null,
  toastMode: BackendErrorToastMode,
  options: ResolveBackendFormErrorPresentationOptions,
) {
  if (!backendError || toastMode === "never") {
    return null;
  }

  if (toastMode === "always") {
    return resolveTranslatedBackendMessage(backendError, options);
  }

  return isUnexpectedBackendError(backendError)
    ? resolveTranslatedBackendMessage(backendError, options)
    : null;
}

export function resolveBackendFormErrorPresentation(
  error: unknown,
  options: ResolveBackendFormErrorPresentationOptions = {},
): BackendFormErrorPresentation {
  const backendError = parseBackendError(error, options.fallbackMessage);
  const toastMode = options.toastMode ?? "unexpected";

  return {
    backendError,
    bannerMessage: resolveBannerMessage(backendError, options),
    toastMessage: resolveToastMessage(backendError, toastMode, options),
  };
}

export function presentBackendErrorToast(
  error: unknown,
  options: {
    fallbackMessage?: string;
    translateMessage?: BackendErrorTranslator;
    toastMode?: BackendErrorToastMode;
  } = {},
) {
  const presentation = resolveBackendFormErrorPresentation(error, {
    fallbackMessage: options.fallbackMessage,
    translateMessage: options.translateMessage,
    toastMode: options.toastMode ?? "always",
  });

  if (presentation.toastMessage) {
    toast.error(presentation.toastMessage);
  }

  return presentation.toastMessage;
}

export function getTranslatedBackendErrorMessage(
  error: unknown,
  options: {
    fallbackMessage?: string;
    translateMessage?: BackendErrorTranslator;
  } = {},
) {
  const backendError = parseBackendError(
    error,
    options.fallbackMessage ?? getBackendErrorMessage(error),
  );

  return resolveTranslatedBackendMessage(backendError, options);
}
