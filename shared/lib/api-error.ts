export type BackendError = {
  statusCode: number;
  error: string;
  code: string;
  messageKey?: string;
  message: string;
  details?: unknown;
  path?: string;
  timestamp?: string;
  requestId?: string;
};

export type BackendFieldError = {
  code?: string;
  field: string;
  message: string;
  messageKey?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isBackendError(value: unknown): value is BackendError {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.statusCode === "number" &&
    typeof value.error === "string" &&
    typeof value.code === "string" &&
    typeof value.message === "string"
  );
}

export function isBackendValidationError(error: BackendError | null): boolean {
  return error?.code === "VALIDATION_ERROR";
}

export function isUnexpectedBackendError(error: BackendError | null): boolean {
  if (!error) {
    return false;
  }

  return error.code === "INTERNAL_SERVER_ERROR" || error.statusCode >= 500;
}

export function isBackendFieldError(value: unknown): value is BackendFieldError {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.field === "string" && typeof value.message === "string";
}
