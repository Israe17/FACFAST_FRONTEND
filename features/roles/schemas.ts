import { z } from "zod/v4";

import {
  entityCodePattern,
  optionalTrimmedString,
  requiredTrimmedString,
  roleKeyPattern,
} from "@/shared/lib/validation";

const roleIdSchema = z.union([z.string(), z.number()]).transform(String);
const permissionIdSchema = z.coerce.number();

export const permissionDefinitionSchema = z
  .object({
    action: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    description: z.string().optional().catch(undefined),
    id: permissionIdSchema,
    key: z.string(),
    module: z.string().optional().catch(undefined),
  })
  .passthrough();

export const rolePermissionSchema = z
  .object({
    id: permissionIdSchema,
    key: z.string(),
  })
  .passthrough();

export const roleSchema = z
  .object({
    business_id: roleIdSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    id: roleIdSchema,
    is_system: z.boolean().optional().default(false),
    name: z.string().catch("Role"),
    permissions: z.array(rolePermissionSchema).optional().default([]),
    role_key: z.string().catch("role"),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const createRoleSchema = z.object({
  code: optionalTrimmedString(
    z.string().regex(entityCodePattern, "Use a code like AA-0001."),
  ),
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
  role_key: z
    .string()
    .trim()
    .regex(roleKeyPattern, "Use a role key like admin or sales_manager."),
});

export const updateRoleSchema = createRoleSchema.partial();

export const assignRolePermissionsSchema = z.object({
  permission_ids: z
    .array(permissionIdSchema)
    .default([])
    .transform((values) => Array.from(new Set(values))),
});
