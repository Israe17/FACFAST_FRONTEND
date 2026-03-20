import { z } from "zod/v4";

export const identificationTypeValues = ["01", "02", "03", "04", "05"] as const;
const identificationTypeAliasMap: Record<string, (typeof identificationTypeValues)[number]> = {
  "01": "01",
  "02": "02",
  "03": "03",
  "04": "04",
  "05": "05",
  dimex: "03",
  extranjero: "05",
  fisica: "01",
  foreign: "05",
  juridica: "02",
  legal: "02",
  nite: "04",
};

export const entityCodePattern = /^[A-Z]{2}-\d{4,}$/;
export const roleKeyPattern = /^[a-z][a-z0-9_]*$/;
export const positiveIntegerPattern = /^[1-9]\d*$/;

export const businessCodePattern = entityCodePattern;
export const branchCodePattern = /^BR-\d{4,}$/;
export const terminalCodePattern = /^TR-\d{4,}$/;
export const branchNumberPattern = /^\d{3}$/;
export const terminalNumberPattern = /^\d{5}$/;
export const digitsPattern = /^\d+$/;
export const currencyCodePattern = /^[A-Z]{3}$/;

export const identificationTypeSchema = z.enum(identificationTypeValues);

export function normalizeIdentificationTypeValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  return identificationTypeAliasMap[normalized] ?? value;
}

export function requiredTrimmedString(message: string, minimum = 1) {
  return z.string().trim().min(minimum, message);
}

export function optionalTrimmedString<TSchema extends z.ZodTypeAny>(schema: TSchema) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, schema.optional());
}
