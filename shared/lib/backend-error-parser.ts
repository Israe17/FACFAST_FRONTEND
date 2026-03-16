import { isAxiosError } from "axios";

import {
  type BackendError,
  type BackendFieldError,
  isBackendError,
} from "./api-error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeMessage(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => normalizeMessage(item))
      .filter((item): item is string => Boolean(item));

    return parts.length > 0 ? parts.join(", ") : null;
  }

  if (isRecord(value)) {
    if ("message" in value) {
      return normalizeMessage(value.message);
    }

    if ("error" in value) {
      return normalizeMessage(value.error);
    }
  }

  return null;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getStatusCode(error: unknown, payload: unknown): number {
  if (isRecord(payload) && typeof payload.statusCode === "number") {
    return payload.statusCode;
  }

  if (isAxiosError(error) && typeof error.response?.status === "number") {
    return error.response.status;
  }

  return 500;
}

function getFallbackCode(statusCode: number) {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    default:
      return statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "UNKNOWN_ERROR";
  }
}

function getFallbackErrorName(statusCode: number) {
  switch (statusCode) {
    case 400:
      return "BadRequest";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "NotFound";
    case 409:
      return "Conflict";
    default:
      return statusCode >= 500 ? "InternalServerError" : "Error";
  }
}

function getErrorPayload(error: unknown): unknown {
  const payload = isAxiosError(error) ? error.response?.data ?? null : error;

  if (isBackendError(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return payload;
  }

  const nestedCandidates = [
    payload.data,
    payload.error,
    isRecord(payload.response) ? payload.response.data : undefined,
  ];

  const nestedBackendError = nestedCandidates.find((candidate) => isBackendError(candidate));
  return nestedBackendError ?? payload;
}

function buildFallbackBackendError(error: unknown, fallback: string): BackendError | null {
  if (typeof error === "string") {
    return {
      code: "UNKNOWN_ERROR",
      error: "Error",
      message: error,
      statusCode: 500,
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      error: error.name || "Error",
      message: error.message || fallback,
      statusCode: 500,
    };
  }

  return null;
}

export function parseBackendError(
  error: unknown,
  fallback = "Ocurrio un error inesperado.",
): BackendError | null {
  const payload = getErrorPayload(error);

  if (isBackendError(payload)) {
    return {
      ...payload,
      message: normalizeMessage(payload.message) ?? fallback,
    };
  }

  if (isRecord(payload)) {
    const statusCode = getStatusCode(error, payload);

    return {
      code: toOptionalString(payload.code) ?? getFallbackCode(statusCode),
      details: payload.details,
      error: toOptionalString(payload.error) ?? getFallbackErrorName(statusCode),
      message:
        normalizeMessage(payload.message) ??
        normalizeMessage(payload.error) ??
        (error instanceof Error ? error.message : null) ??
        fallback,
      messageKey: toOptionalString(payload.messageKey),
      path: toOptionalString(payload.path),
      requestId: toOptionalString(payload.requestId),
      statusCode,
      timestamp: toOptionalString(payload.timestamp),
    };
  }

  return buildFallbackBackendError(error, fallback);
}

function parseFieldErrorEntry(entry: unknown): BackendFieldError | null {
  if (!isRecord(entry) || typeof entry.field !== "string") {
    return null;
  }

  const message = normalizeMessage(entry.message);

  if (!message) {
    return null;
  }

  return {
    code: toOptionalString(entry.code),
    field: entry.field,
    message,
    messageKey: toOptionalString(entry.messageKey),
  };
}

function getDetailsPayload(error: unknown) {
  return parseBackendError(error)?.details;
}

export function getBackendFieldErrors(error: unknown): BackendFieldError[] {
  const details = getDetailsPayload(error);

  if (Array.isArray(details)) {
    return details
      .map((detail) => parseFieldErrorEntry(detail))
      .filter((detail): detail is BackendFieldError => Boolean(detail));
  }

  const singleDetail = parseFieldErrorEntry(details);
  return singleDetail ? [singleDetail] : [];
}

export function getBackendErrorMessage(
  error: unknown,
  fallback = "Ocurrio un error inesperado.",
) {
  return parseBackendError(error, fallback)?.message ?? fallback;
}
