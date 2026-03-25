// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Extract an array from a response envelope.
 * Tries explicit keys first, then common envelope keys.
 */
export function extractCollection(data: unknown, explicitKeys: string[] = []): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (!isRecord(data)) {
    return [];
  }
  for (const key of [...explicitKeys, "items", "data", "results"]) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }
  return [];
}

/**
 * Extract a single entity from a response envelope.
 * Tries explicit keys first, then common envelope keys.
 */
export function extractEntity(data: unknown, explicitKeys: string[] = []): unknown {
  if (!isRecord(data) || Array.isArray(data)) {
    return data;
  }
  for (const key of [...explicitKeys, "data", "item", "result"]) {
    if (data[key] !== undefined) {
      return data[key];
    }
  }
  return data;
}

/**
 * Remove entries with null, undefined, or empty string values from an object.
 */
export function compactRecord<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

/**
 * Remove entries with undefined or empty string values from an object.
 * Unlike compactRecord, this preserves null values.
 */
export function compactNullableRecord<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== ""),
  );
}

/**
 * Convert a string, number, or null/undefined value to a number, or undefined.
 */
export function toNumberId(value: string | number | null | undefined): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
