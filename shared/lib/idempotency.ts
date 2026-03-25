import type { AxiosRequestConfig } from "axios";

/**
 * Generate a unique idempotency key using crypto.randomUUID().
 * Used to prevent duplicate processing of state-changing operations.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Add an Idempotency-Key header to an Axios request config.
 * The backend reads this via the @IdempotencyKey() decorator.
 *
 * Usage:
 * ```ts
 * await http.post(`/sale-orders/${id}/confirm`, undefined, withIdempotencyKey());
 * ```
 */
export function withIdempotencyKey(config?: AxiosRequestConfig): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...config?.headers,
      "Idempotency-Key": generateIdempotencyKey(),
    },
  };
}
