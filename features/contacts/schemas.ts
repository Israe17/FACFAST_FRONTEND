import { z } from "zod/v4";

import { contactTypeValues, identificationTypeValues } from "./constants";

const idSchema = z.union([z.string(), z.number()]).transform(String);

const contactTypeSchema = z.enum(contactTypeValues);
const identificationTypeSchema = z.enum(identificationTypeValues);

const optionalTextSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());

function makeOptionalTrimmedTextSchema(minLength?: number, message?: string) {
  const baseSchema = minLength
    ? z.string().min(minLength, message ?? `Must be at least ${minLength} characters.`)
    : z.string();

  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, baseSchema.optional());
}

const optionalCodeSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().regex(/^CT-\d{4,}$/, "Use a code like CT-0001.").optional());

const optionalEmailSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().email("Enter a valid email.").optional());

const optionalPercentageSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.coerce.number().min(0, "Must be at least 0.").max(100, "Cannot exceed 100.").optional());

const optionalIsoDateSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid ISO date.").optional());

export const contactSchema = z
  .object({
    address: z.string().optional().catch(undefined),
    canton: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    commercial_name: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    district: z.string().optional().catch(undefined),
    economic_activity_code: z.string().optional().catch(undefined),
    email: z.string().optional().catch(undefined),
    exoneration_document_number: z.string().optional().catch(undefined),
    exoneration_institution: z.string().optional().catch(undefined),
    exoneration_issue_date: z.string().optional().catch(undefined),
    exoneration_percentage: z.coerce.number().optional().catch(undefined),
    exoneration_type: z.string().optional().catch(undefined),
    id: idSchema,
    identification_number: z.string().optional().catch(undefined),
    identification_type: identificationTypeSchema.optional().catch(undefined),
    is_active: z.boolean().optional().default(true),
    name: z.string().catch("Contact"),
    phone: z.string().optional().catch(undefined),
    province: z.string().optional().catch(undefined),
    tax_condition: z.string().optional().catch(undefined),
    type: contactTypeSchema.optional().catch(undefined),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const createContactSchema = z.object({
  address: makeOptionalTrimmedTextSchema(5, "Address must be at least 5 characters."),
  canton: optionalTextSchema,
  code: optionalCodeSchema,
  commercial_name: makeOptionalTrimmedTextSchema(2, "Commercial name must be at least 2 characters."),
  district: optionalTextSchema,
  economic_activity_code: optionalTextSchema,
  email: optionalEmailSchema,
  exoneration_document_number: optionalTextSchema,
  exoneration_institution: optionalTextSchema,
  exoneration_issue_date: optionalIsoDateSchema,
  exoneration_percentage: optionalPercentageSchema,
  exoneration_type: optionalTextSchema,
  identification_number: z.string().trim().min(2, "Identification number must be at least 2 characters."),
  identification_type: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, identificationTypeSchema),
  is_active: z.boolean().default(true),
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  phone: optionalTextSchema,
  province: optionalTextSchema,
  tax_condition: optionalTextSchema,
  type: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, contactTypeSchema),
});

export const updateContactSchema = z.object({
  address: makeOptionalTrimmedTextSchema(5, "Address must be at least 5 characters."),
  canton: optionalTextSchema,
  code: optionalCodeSchema,
  commercial_name: makeOptionalTrimmedTextSchema(2, "Commercial name must be at least 2 characters."),
  district: optionalTextSchema,
  economic_activity_code: optionalTextSchema,
  email: optionalEmailSchema,
  exoneration_document_number: optionalTextSchema,
  exoneration_institution: optionalTextSchema,
  exoneration_issue_date: optionalIsoDateSchema,
  exoneration_percentage: optionalPercentageSchema,
  exoneration_type: optionalTextSchema,
  identification_number: makeOptionalTrimmedTextSchema(
    2,
    "Identification number must be at least 2 characters.",
  ),
  identification_type: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, identificationTypeSchema.optional()),
  is_active: z.boolean().optional(),
  name: makeOptionalTrimmedTextSchema(2, "Name must be at least 2 characters."),
  phone: optionalTextSchema,
  province: optionalTextSchema,
  tax_condition: optionalTextSchema,
  type: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, contactTypeSchema.optional()),
});
