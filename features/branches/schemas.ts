import { z } from "zod/v4";

import {
  branchCodePattern,
  branchNumberPattern,
  digitsPattern,
  identificationTypeSchema,
  optionalTrimmedString,
  requiredTrimmedString,
  terminalCodePattern,
  terminalNumberPattern,
} from "@/shared/lib/validation";

const stringIdSchema = z.union([z.string(), z.number()]).transform(String);
const optionalTextSchema = optionalTrimmedString(z.string());
const optionalCodeSchema = optionalTrimmedString(
  z.string().regex(branchCodePattern, "Use format BR-0000 or longer."),
);
const optionalTerminalCodeSchema = optionalTrimmedString(
  z.string().regex(terminalCodePattern, "Use format TR-0000 or longer."),
);
const optionalEmailSchema = optionalTrimmedString(
  z.string().email("Enter a valid email."),
);

export const terminalSchema = z
  .object({
    branch_id: stringIdSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    id: stringIdSchema,
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
    business_id: stringIdSchema.optional().catch(undefined),
    business_name: z.string().optional().catch(undefined),
    canton: z.string().optional().catch(undefined),
    cedula_juridica: z.string().optional().catch(undefined),
    cert_path: z.string().optional().catch(undefined),
    city: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    district: z.string().optional().catch(undefined),
    email: z.string().optional().catch(undefined),
    hacienda_username: z.string().optional().catch(undefined),
    has_crypto_key: z.boolean().optional().default(false),
    has_hacienda_password: z.boolean().optional().default(false),
    has_mail_key: z.boolean().optional().default(false),
    id: stringIdSchema,
    identification_number: z.string().optional().catch(undefined),
    identification_type: identificationTypeSchema.optional().catch(undefined),
    is_active: z.boolean().optional().default(true),
    legal_name: z.string().optional().catch(undefined),
    name: z.string().catch("Branch"),
    phone: z.string().optional().catch(undefined),
    provider_code: z.string().optional().catch(undefined),
    province: z.string().optional().catch(undefined),
    signature_type: z.string().optional().catch(undefined),
    terminals: z.array(terminalSchema).optional().default([]),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const createBranchSchema = z.object({
  activity_code: optionalTextSchema,
  address: requiredTrimmedString("Address must contain at least 5 characters.", 5),
  branch_number: z
    .string()
    .trim()
    .regex(branchNumberPattern, "Branch number must be exactly 3 digits."),
  business_name: z.string().trim().min(2, "Business name must contain at least 2 characters."),
  canton: requiredTrimmedString("Canton is required."),
  cedula_juridica: z
    .string()
    .trim()
    .regex(digitsPattern, "Cedula juridica must contain only digits."),
  cert_path: optionalTextSchema,
  city: optionalTextSchema,
  code: optionalCodeSchema,
  crypto_key: optionalTextSchema,
  district: requiredTrimmedString("District is required."),
  email: optionalEmailSchema,
  hacienda_password: optionalTextSchema,
  hacienda_username: optionalTextSchema,
  identification_number: optionalTrimmedString(
    z.string().min(2, "Identification number must contain at least 2 characters."),
  ),
  identification_type: identificationTypeSchema.optional(),
  is_active: z.boolean().default(true),
  legal_name: z.string().trim().min(2, "Legal name must contain at least 2 characters."),
  mail_key: optionalTextSchema,
  name: optionalTrimmedString(
    z.string().min(2, "Branch name must contain at least 2 characters."),
  ),
  phone: optionalTextSchema,
  provider_code: optionalTextSchema,
  province: requiredTrimmedString("Province is required."),
  signature_type: optionalTextSchema,
});

export const updateBranchSchema = createBranchSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const createTerminalSchema = z.object({
  code: optionalTerminalCodeSchema,
  is_active: z.boolean().default(true),
  name: z.string().trim().min(2, "Name must contain at least 2 characters."),
  terminal_number: z
    .string()
    .trim()
    .regex(terminalNumberPattern, "Terminal number must be exactly 5 digits."),
});

export const updateTerminalSchema = createTerminalSchema.partial().extend({
  is_active: z.boolean().optional(),
});
