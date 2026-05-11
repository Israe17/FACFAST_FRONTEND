import { z } from "zod/v4";

import { idSchema } from "@/shared/lib/api-types";
import {
  branchCodePattern,
  branchNumberPattern,
  digitsPattern,
  identificationTypeSchema,
  normalizeIdentificationTypeValue,
  optionalTrimmedString,
  requiredTrimmedString,
  terminalCodePattern,
  terminalNumberPattern,
} from "@/shared/lib/validation";
const optionalTextSchema = optionalTrimmedString(z.string());
const optionalCodeSchema = optionalTrimmedString(
  z.string().regex(branchCodePattern, "Usa el formato BR-0000 o mas largo."),
);
const optionalTerminalCodeSchema = optionalTrimmedString(
  z.string().regex(terminalCodePattern, "Usa el formato TR-0000 o mas largo."),
);
const optionalEmailSchema = optionalTrimmedString(
  z.string().email("Ingresa un correo valido."),
);

export const terminalSchema = z
  .object({
    branch_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    name: z.string().catch("Terminal"),
    terminal_number: z.string().optional().catch(undefined),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const branchSchema = z
  .object({
    activity_code: z.string().optional().catch(undefined),
    address: z.string().optional().catch(undefined),
    branch_number: z.string().optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    business_name: z.string().optional().catch(undefined),
    canton: z.string().optional().catch(undefined),
    canton_id: z.number().int().nullable().optional().catch(null),
    cedula_juridica: z.string().optional().catch(undefined),
    cert_path: z.string().optional().catch(undefined),
    city: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    country_id: z.number().int().nullable().optional().catch(null),
    created_at: z.string().optional(),
    district: z.string().optional().catch(undefined),
    district_id: z.number().int().nullable().optional().catch(null),
    email: z.string().optional().catch(undefined),
    hacienda_username: z.string().optional().catch(undefined),
    has_crypto_key: z.boolean().optional().default(false),
    has_hacienda_password: z.boolean().optional().default(false),
    has_mail_key: z.boolean().optional().default(false),
    id: idSchema,
    identification_number: z.string().optional().catch(undefined),
    identification_type: z
      .preprocess(normalizeIdentificationTypeValue, identificationTypeSchema.optional())
      .catch(undefined),
    is_active: z.boolean().optional().default(true),
    latitude: z.number().nullable().optional().catch(null),
    legal_name: z.string().optional().catch(undefined),
    longitude: z.number().nullable().optional().catch(null),
    name: z.string().catch("Branch"),
    phone: z.string().optional().catch(undefined),
    provider_code: z.string().optional().catch(undefined),
    province: z.string().optional().catch(undefined),
    province_id: z.number().int().nullable().optional().catch(null),
    signature_type: z.string().optional().catch(undefined),
    terminals: z.array(terminalSchema).optional().default([]),
    updated_at: z.string().optional(),
  })
  .passthrough();

const branchInputObject = z.object({
  activity_code: optionalTextSchema,
  address: requiredTrimmedString("La direccion debe tener al menos 5 caracteres.", 5),
  branch_number: z
    .string()
    .trim()
    .regex(branchNumberPattern, "El numero de sucursal debe ser exactamente 3 digitos."),
  business_name: z.string().trim().min(2, "El nombre comercial debe tener al menos 2 caracteres."),
  canton: optionalTextSchema,
  canton_id: z.number().int().positive().nullable(),
  cedula_juridica: z
    .string()
    .trim()
    .regex(digitsPattern, "La cedula juridica debe contener solo digitos."),
  cert_path: optionalTextSchema,
  city: optionalTextSchema,
  code: optionalCodeSchema,
  country_id: z.number().int().positive().nullable(),
  crypto_key: optionalTextSchema,
  district: optionalTextSchema,
  district_id: z.number().int().positive().nullable(),
  email: optionalEmailSchema,
  hacienda_password: optionalTextSchema,
  hacienda_username: optionalTextSchema,
  identification_number: optionalTrimmedString(
    z.string().min(2, "El numero de identificacion debe tener al menos 2 caracteres."),
  ),
  identification_type: z.preprocess(
    normalizeIdentificationTypeValue,
    identificationTypeSchema.optional(),
  ),
  is_active: z.boolean().default(true),
  latitude: z.number().nullable().optional().catch(null),
  legal_name: z.string().trim().min(2, "La razon social debe tener al menos 2 caracteres."),
  longitude: z.number().nullable().optional().catch(null),
  mail_key: optionalTextSchema,
  name: optionalTrimmedString(
    z.string().min(2, "El nombre de la sucursal debe tener al menos 2 caracteres."),
  ),
  phone: optionalTextSchema,
  provider_code: optionalTextSchema,
  province: optionalTextSchema,
  province_id: z.number().int().positive().nullable(),
  signature_type: optionalTextSchema,
});

function refineRequiredRegionIds<T extends {
  country_id: number | null;
  province_id: number | null;
  canton_id: number | null;
  district_id: number | null;
}>(value: T, ctx: z.RefinementCtx) {
  const required: Array<{
    key: "country_id" | "province_id" | "canton_id" | "district_id";
    message: string;
  }> = [
    { key: "country_id", message: "Selecciona un país." },
    { key: "province_id", message: "Selecciona una provincia." },
    { key: "canton_id", message: "Selecciona un cantón." },
    { key: "district_id", message: "Selecciona un distrito." },
  ];
  for (const { key, message } of required) {
    if (value[key] == null) {
      ctx.addIssue({ code: "custom", message, path: [key] });
    }
  }
}

export const createBranchSchema = branchInputObject.superRefine(
  refineRequiredRegionIds,
);

export const updateBranchSchema = branchInputObject.partial().extend({
  is_active: z.boolean().optional(),
});

export const createTerminalSchema = z.object({
  code: optionalTerminalCodeSchema,
  is_active: z.boolean().default(true),
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  terminal_number: z
    .string()
    .trim()
    .regex(terminalNumberPattern, "El numero de terminal debe ser exactamente 5 digitos."),
});

export const updateTerminalSchema = createTerminalSchema.partial().extend({
  is_active: z.boolean().optional(),
});
