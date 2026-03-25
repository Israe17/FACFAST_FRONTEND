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
