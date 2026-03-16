import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(value?: string | null) {
  if (!value) {
    return "FF";
  }

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function compactRecord<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== ""),
  ) as Partial<T>;
}

export function formatBranchLabel(branchId: string) {
  return `Sucursal ${branchId}`;
}

export function formatRouteSegment(segment: string) {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getErrorMessage(error: unknown, fallback = "Ocurrio un error inesperado.") {
  return getBackendErrorMessage(error, fallback);
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
