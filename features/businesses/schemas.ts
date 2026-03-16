import { z } from "zod/v4";

import {
  businessCodePattern,
  currencyCodePattern,
  digitsPattern,
  identificationTypeSchema,
  optionalTrimmedString,
  requiredTrimmedString,
  terminalNumberPattern,
} from "@/shared/lib/validation";

const idSchema = z.union([z.string(), z.number()]).transform(String);

const optionalEmailSchema = optionalTrimmedString(
  z.string().email("Ingresa un correo electronico valido."),
);
const optionalNumericTextSchema = optionalTrimmedString(
  z.string().regex(digitsPattern, "Usa solo numeros."),
);
const optionalCodeSchema = optionalTrimmedString(
  z.string().regex(businessCodePattern, "Usa formato AA-0000 o mayor."),
);
const optionalCurrencyCodeSchema = optionalTrimmedString(
  z.string().regex(currencyCodePattern, "Usa un codigo de moneda de 3 letras."),
);

export const businessSchema = z
  .object({
    address: z.string().optional().catch(undefined),
    canton: z.string().optional().catch(undefined),
    city: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    country: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    currency_code: z.string().optional().catch(undefined),
    district: z.string().optional().catch(undefined),
    email: z.string().optional().catch(undefined),
    id: idSchema.optional(),
    identification_number: z.string().optional().catch(undefined),
    identification_type: identificationTypeSchema.optional().catch(undefined),
    is_active: z.boolean().optional().default(true),
    language: z.string().optional().catch(undefined),
    legal_name: z.string().optional().catch(undefined),
    logo_url: z.string().optional().catch(undefined),
    name: z.string().optional().catch(undefined),
    phone: z.string().optional().catch(undefined),
    postal_code: z.string().optional().catch(undefined),
    province: z.string().optional().catch(undefined),
    timezone: z.string().optional().catch(undefined),
    updated_at: z.string().optional(),
    website: z.string().optional().catch(undefined),
  })
  .passthrough();

export const updateCurrentBusinessSchema = z.object({
  address: optionalTrimmedString(z.string().min(5, "La direccion debe tener al menos 5 caracteres.")),
  canton: optionalTrimmedString(z.string()),
  city: optionalTrimmedString(z.string()),
  code: optionalCodeSchema,
  country: optionalTrimmedString(z.string()),
  currency_code: optionalCurrencyCodeSchema,
  district: optionalTrimmedString(z.string()),
  email: optionalEmailSchema,
  identification_number: optionalTrimmedString(
    z.string().min(2, "La identificacion debe tener al menos 2 caracteres."),
  ),
  identification_type: identificationTypeSchema.optional(),
  is_active: z.boolean().optional(),
  language: optionalTrimmedString(z.string().min(2, "El idioma es obligatorio.")),
  legal_name: optionalTrimmedString(
    z.string().min(2, "La razon social debe tener al menos 2 caracteres."),
  ),
  logo_url: optionalTrimmedString(z.string().url("Ingresa una URL valida.")),
  name: optionalTrimmedString(z.string().min(2, "El nombre debe tener al menos 2 caracteres.")),
  phone: optionalTrimmedString(z.string()),
  postal_code: optionalNumericTextSchema,
  province: optionalTrimmedString(z.string()),
  timezone: optionalTrimmedString(z.string().min(2, "La zona horaria es obligatoria.")),
  website: optionalTrimmedString(z.string().url("Ingresa una URL valida.")),
});

const onboardingBusinessSchema = z.object({
  address: requiredTrimmedString("La direccion es obligatoria.", 5),
  canton: requiredTrimmedString("El canton es obligatorio.", 2),
  city: optionalTrimmedString(z.string()),
  country: requiredTrimmedString("El pais es obligatorio.", 2),
  currency_code: z
    .string()
    .trim()
    .regex(currencyCodePattern, "Usa un codigo de moneda de 3 letras."),
  district: requiredTrimmedString("El distrito es obligatorio.", 2),
  email: optionalEmailSchema,
  identification_number: requiredTrimmedString("La identificacion es obligatoria.", 2),
  identification_type: identificationTypeSchema,
  is_active: z.boolean().default(true),
  language: requiredTrimmedString("El idioma es obligatorio.", 2),
  legal_name: requiredTrimmedString("La razon social es obligatoria.", 2),
  logo_url: optionalTrimmedString(z.string().url("Ingresa una URL valida.")),
  name: requiredTrimmedString("El nombre comercial es obligatorio.", 2),
  phone: optionalTrimmedString(z.string()),
  postal_code: optionalNumericTextSchema,
  province: requiredTrimmedString("La provincia es obligatoria.", 2),
  timezone: requiredTrimmedString("La zona horaria es obligatoria.", 2),
  website: optionalTrimmedString(z.string().url("Ingresa una URL valida.")),
});

const onboardingOwnerSchema = z.object({
  owner_email: z.string().trim().email("Ingresa un correo valido."),
  owner_last_name: requiredTrimmedString("El apellido es obligatorio.", 2),
  owner_name: requiredTrimmedString("El nombre es obligatorio.", 2),
  owner_password: z
    .string()
    .min(10, "La contrasena del propietario debe tener al menos 10 caracteres."),
});

const onboardingInitialBranchSchema = z.object({
  activity_code: optionalTrimmedString(z.string()),
  branch_address: requiredTrimmedString("La direccion de la sucursal es obligatoria.", 5),
  branch_canton: requiredTrimmedString("El canton es obligatorio.", 2),
  branch_city: optionalTrimmedString(z.string()),
  branch_district: requiredTrimmedString("El distrito es obligatorio.", 2),
  branch_email: optionalEmailSchema,
  branch_identification_number: requiredTrimmedString(
    "La identificacion de la sucursal es obligatoria.",
    2,
  ),
  branch_identification_type: identificationTypeSchema,
  branch_name: requiredTrimmedString("El nombre de la sucursal es obligatorio.", 2),
  branch_number: z
    .string()
    .trim()
    .regex(/^\d{3}$/, "El numero de sucursal debe tener exactamente 3 digitos."),
  branch_phone: optionalTrimmedString(z.string()),
  branch_province: requiredTrimmedString("La provincia es obligatoria.", 2),
  is_active: z.boolean().default(true),
  provider_code: optionalTrimmedString(z.string()),
});

const onboardingInitialTerminalSchema = z.object({
  create_initial_terminal: z.boolean().default(false),
  terminal_name: optionalTrimmedString(
    z.string().min(2, "El nombre de la terminal debe tener al menos 2 caracteres."),
  ),
  terminal_number: optionalTrimmedString(
    z.string().regex(terminalNumberPattern, "La terminal debe tener exactamente 5 digitos."),
  ),
});

export const onboardingSchema = z
  .object({
    business: onboardingBusinessSchema,
    initial_branch: onboardingInitialBranchSchema,
    initial_terminal: onboardingInitialTerminalSchema.default({
      create_initial_terminal: false,
    }),
    owner: onboardingOwnerSchema,
  })
  .superRefine((value, ctx) => {
    if (!value.initial_terminal.create_initial_terminal) {
      return;
    }

    if (!value.initial_terminal.terminal_name) {
      ctx.addIssue({
        code: "custom",
        message: "El nombre de la terminal inicial es obligatorio.",
        path: ["initial_terminal", "terminal_name"],
      });
    }

    if (!value.initial_terminal.terminal_number) {
      ctx.addIssue({
        code: "custom",
        message: "El numero de la terminal inicial es obligatorio.",
        path: ["initial_terminal", "terminal_number"],
      });
    }
  });
