import { z } from "zod/v4";

const idSchema = z.union([z.string(), z.number()]).transform(String);
const nullableIdSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => (value == null ? null : String(value)));
const sessionModeSchema = z.enum(["tenant", "platform", "tenant_context"]);
const userTypeSchema = z.enum(["owner", "staff", "system"]);

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo valido."),
  password: z.string().min(10, "La contrasena debe tener al menos 10 caracteres."),
});

export const authUserSchema = z.object({
  id: idSchema,
  business_id: nullableIdSchema.default(null),
  active_business_language: z.string().trim().optional().catch(undefined),
  email: z.string().email(),
  name: z.string().min(1),
  roles: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
  branch_ids: z.array(idSchema).default([]),
  max_sale_discount: z.coerce.number().default(0),
  user_type: userTypeSchema.default("staff"),
  is_platform_admin: z.boolean().default(false),
  acting_business_id: nullableIdSchema.default(null),
  acting_branch_id: nullableIdSchema.default(null),
  mode: sessionModeSchema.default("tenant"),
});
