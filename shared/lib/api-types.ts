import { z } from "zod/v4";

// ─── Response Types (match backend DTOs) ───

/** Matches backend PaginatedResponseDto */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

/** Matches backend CursorResponseDto */
export type CursorResponse<T> = {
  data: T[];
  next_cursor: number | null;
  has_more: boolean;
};

// ─── Query Parameter Types ───

/** Matches backend PaginatedQueryDto */
export type PaginatedQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
};

/** Matches backend CursorQueryDto */
export type CursorQueryParams = {
  cursor?: number;
  limit?: number;
  search?: string;
  sort_order?: "ASC" | "DESC";
};

// ─── Common Zod Schemas ───

/** Coerces string or number IDs to string. Used across all feature schemas. */
export const idSchema = z.union([z.string(), z.number()]).transform(String);

/** Nullable variant of idSchema. */
export const nullableIdSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => (value == null ? null : String(value)));

// ─── Zod Schema Factories ───

/** Create a Zod schema for a paginated response wrapping the given item schema. */
export function paginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    total_pages: z.number(),
  });
}

/** Create a Zod schema for a cursor-based response wrapping the given item schema. */
export function cursorSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    next_cursor: z.number().nullable(),
    has_more: z.boolean(),
  });
}
