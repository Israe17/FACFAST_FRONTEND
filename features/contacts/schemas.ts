import { z } from "zod/v4";

import { idSchema, nullableIdSchema } from "@/shared/lib/api-types";
import { normalizeIdentificationTypeValue } from "@/shared/lib/validation";

import { contactTypeValues, identificationTypeValues } from "./constants";

const contactTypeSchema = z.enum(contactTypeValues);
const identificationTypeSchema = z.enum(identificationTypeValues);

const optionalTextSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());

const nullableOptionalTextSchema = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}, z.union([z.string(), z.null()]).optional());

function makeOptionalTrimmedTextSchema(minLength?: number, message?: string) {
  const baseSchema = minLength
    ? z.string().min(minLength, message ?? `Debe tener al menos ${minLength} caracteres.`)
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
}, z.string().regex(/^CT-\d{4,}$/, "Usa un codigo como CT-0001.").optional());

const optionalEmailSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().email("Ingresa un correo valido.").optional());

const optionalPercentageSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.coerce.number().min(0, "Debe ser al menos 0.").max(100, "No puede exceder 100.").optional());

const optionalNumberSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.coerce.number().min(0, "Debe ser al menos 0.").optional());

const nullableOptionalNumberSchema = z.preprocess((value) => {
  if (value === "") {
    return undefined;
  }

  if (value === null || value === undefined) {
    return value;
  }

  return value;
}, z.union([z.coerce.number().min(0, "Debe ser al menos 0."), z.null()]).optional());

const optionalIsoDateSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Ingresa una fecha ISO valida.").optional());

export const contactSchema = z
  .object({
    address: z.string().optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    canton: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    commercial_name: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    delivery_latitude: z.number().nullable().optional().catch(null),
    delivery_longitude: z.number().nullable().optional().catch(null),
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
    identification_type: z
      .preprocess(normalizeIdentificationTypeValue, identificationTypeSchema.optional())
      .catch(undefined),
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
  address: makeOptionalTrimmedTextSchema(5, "La direccion debe tener al menos 5 caracteres."),
  canton: optionalTextSchema,
  code: optionalCodeSchema,
  commercial_name: makeOptionalTrimmedTextSchema(2, "El nombre comercial debe tener al menos 2 caracteres."),
  district: optionalTextSchema,
  economic_activity_code: optionalTextSchema,
  email: optionalEmailSchema,
  exoneration_document_number: optionalTextSchema,
  exoneration_institution: optionalTextSchema,
  exoneration_issue_date: optionalIsoDateSchema,
  exoneration_percentage: optionalPercentageSchema,
  exoneration_type: optionalTextSchema,
  identification_number: z.string().trim().min(2, "El numero de identificacion debe tener al menos 2 caracteres."),
  identification_type: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return normalizeIdentificationTypeValue(value);
  }, identificationTypeSchema),
  is_active: z.boolean().default(true),
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
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
  address: makeOptionalTrimmedTextSchema(5, "La direccion debe tener al menos 5 caracteres."),
  canton: optionalTextSchema,
  code: optionalCodeSchema,
  commercial_name: makeOptionalTrimmedTextSchema(2, "El nombre comercial debe tener al menos 2 caracteres."),
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
    "El numero de identificacion debe tener al menos 2 caracteres.",
  ),
  identification_type: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return normalizeIdentificationTypeValue(value);
  }, identificationTypeSchema.optional()),
  is_active: z.boolean().optional(),
  name: makeOptionalTrimmedTextSchema(2, "El nombre debe tener al menos 2 caracteres."),
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

const lifecycleSchema = z
  .object({
    can_deactivate: z.boolean().optional().default(false),
    can_delete: z.boolean().optional().default(false),
    can_reactivate: z.boolean().optional().default(false),
    reasons: z.array(z.string()).optional().default([]),
  })
  .passthrough();

const lifecycleFieldSchema = z.preprocess(
  (value) => (value == null ? {} : value),
  lifecycleSchema,
);

const branchSummarySchema = z
  .object({
    branch_number: z.string().optional().catch(undefined),
    business_name: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    name: z.string().catch("Sucursal"),
  })
  .passthrough();

const priceListSummarySchema = z
  .object({
    code: z.string().optional().catch(undefined),
    currency: z.string().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    kind: z.string().optional().catch(undefined),
    name: z.string().catch("Lista de precios"),
  })
  .passthrough();

const accountManagerSummarySchema = z
  .object({
    code: z.string().optional().catch(undefined),
    email: z.string().optional().catch(undefined),
    id: idSchema,
    name: z.string().catch("Usuario"),
    status: z.string().optional().catch(undefined),
  })
  .passthrough();

export const contactBranchAssignmentSchema = z
  .object({
    account_manager: accountManagerSummarySchema.nullable().optional().catch(undefined),
    branch: branchSummarySchema,
    business_id: idSchema.optional().catch(undefined),
    contact_id: idSchema.optional().catch(undefined),
    created_at: z.string().optional(),
    credit_enabled: z.boolean().optional().default(false),
    custom_credit_limit: z.coerce.number().nullable().optional().catch(undefined),
    custom_price_list: priceListSummarySchema.nullable().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    is_default: z.boolean().optional().default(false),
    is_exclusive: z.boolean().optional().default(false),
    is_preferred: z.boolean().optional().default(false),
    lifecycle: lifecycleFieldSchema,
    notes: z.string().nullable().optional().catch(undefined),
    purchases_enabled: z.boolean().optional().default(false),
    sales_enabled: z.boolean().optional().default(false),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const contactBranchContextSchema = z
  .object({
    assignments: z.array(contactBranchAssignmentSchema).optional().default([]),
    contact_id: idSchema,
    global_applies_to_all_branches: z.boolean().optional().default(true),
    mode: z.enum(["global", "scoped"]).optional().default("global"),
  })
  .passthrough();

export const createContactBranchAssignmentSchema = z.object({
  account_manager_user_id: z
    .string()
    .trim()
    .regex(/^\d+$/, "Selecciona un gestor de cuenta valido.")
    .optional(),
  branch_id: z.string().trim().regex(/^\d+$/, "Selecciona una sucursal valida."),
  credit_enabled: z.boolean().default(false),
  custom_credit_limit: optionalNumberSchema,
  custom_price_list_id: z
    .string()
    .trim()
    .regex(/^\d+$/, "Selecciona una lista de precios valida.")
    .optional(),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  is_exclusive: z.boolean().default(false),
  is_preferred: z.boolean().default(false),
  notes: optionalTextSchema,
  purchases_enabled: z.boolean().default(true),
  sales_enabled: z.boolean().default(true),
});

export const updateContactBranchAssignmentSchema = createContactBranchAssignmentSchema
  .omit({
    branch_id: true,
    custom_credit_limit: true,
  })
  .partial()
  .extend({
    account_manager_user_id: nullableIdSchema.optional(),
    custom_credit_limit: nullableOptionalNumberSchema,
    custom_price_list_id: nullableIdSchema.optional(),
    is_active: z.boolean().optional(),
    is_default: z.boolean().optional(),
    is_exclusive: z.boolean().optional(),
    is_preferred: z.boolean().optional(),
    notes: nullableOptionalTextSchema,
    purchases_enabled: z.boolean().optional(),
    sales_enabled: z.boolean().optional(),
  });
