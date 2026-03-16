import { z } from "zod/v4";

import { positiveIntegerPattern } from "@/shared/lib/validation";

export const enterTenantContextSchema = z.object({
  branch_id: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) => value === "" || positiveIntegerPattern.test(value),
      "Selecciona una sucursal valida.",
    ),
  business_id: z
    .string()
    .trim()
    .regex(positiveIntegerPattern, "Selecciona una empresa valida para continuar."),
});
