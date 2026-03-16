import { z } from "zod/v4";

import { entityCodePattern, positiveIntegerPattern } from "@/shared/lib/validation";

const idSchema = z.union([z.string(), z.number()]).transform(String);
const userStatusSchema = z.enum(["active", "inactive", "suspended", "deleted"]);
const userTypeSchema = z.enum(["owner", "staff", "system"]);
const positiveIntegerStringSchema = z
  .string()
  .trim()
  .regex(positiveIntegerPattern, "Use a positive integer id.");
const uniquePositiveIntegerStringArraySchema = z
  .array(positiveIntegerStringSchema)
  .default([])
  .transform((values) => Array.from(new Set(values)));

export const userRoleSummarySchema = z
  .object({
    code: z.string().optional().catch(undefined),
    id: idSchema,
    is_system: z.boolean().optional().default(false),
    name: z.string().catch("Role"),
    role_key: z.string().optional().catch(undefined),
  })
  .passthrough();

export const branchOptionSchema = z
  .object({
    branch_number: z.string().optional().catch(undefined),
    business_name: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    id: idSchema,
    name: z.string().optional().catch(undefined),
  })
  .passthrough()
  .transform((branch) => ({
    branch_number: branch.branch_number,
    business_name: branch.business_name,
    code: branch.code,
    id: branch.id,
    name: branch.name ?? `Sucursal ${branch.id}`,
  }));

export const userSchema = z
  .object({
    allow_login: z.boolean().optional(),
    branch_ids: z.array(idSchema).optional().default([]),
    branches: z.array(branchOptionSchema).optional().default([]),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    email: z.string().catch(""),
    id: idSchema,
    is_platform_admin: z.boolean().optional().default(false),
    last_login_at: z.string().nullable().optional(),
    max_sale_discount: z.coerce.number().optional().catch(undefined),
    name: z.string().catch(""),
    permissions: z.array(z.string()).optional().default([]),
    role_ids: z.array(idSchema).optional().default([]),
    roles: z.array(userRoleSummarySchema).optional().default([]),
    status: userStatusSchema.optional().default("inactive"),
    updated_at: z.string().optional(),
    user_type: userTypeSchema.optional().catch(undefined),
  })
  .passthrough()
  .transform((user) => {
    const branch_ids = Array.from(
      new Set([...user.branch_ids, ...user.branches.map((branch) => branch.id)]),
    );

    return {
      allow_login: user.allow_login,
      branch_ids,
      branches: user.branches,
      code: user.code,
      created_at: user.created_at,
      email: user.email,
      id: user.id,
      is_platform_admin: user.is_platform_admin,
      last_login_at: user.last_login_at,
      max_sale_discount: user.max_sale_discount ?? 0,
      name: user.name || user.email,
      permissions: user.permissions,
      role_ids: user.role_ids,
      roles: user.roles,
      status: user.status,
      updated_at: user.updated_at,
      user_type: user.user_type,
    };
  });

export const effectivePermissionsSchema = z
  .array(z.string())
  .or(
    z
      .object({
        permissions: z.array(z.string()).default([]),
      })
      .transform((value) => value.permissions),
  )
  .transform((permissions) => permissions.sort((left, right) => left.localeCompare(right)));

export const createUserSchema = z.object({
  allow_login: z.boolean().optional(),
  branch_ids: uniquePositiveIntegerStringArraySchema.optional().default([]),
  code: z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, z.string().regex(entityCodePattern, "Use a code like AA-0001.").optional()),
  email: z.string().trim().email("Enter a valid email."),
  max_sale_discount: z.coerce.number().min(0).max(100).default(0),
  name: z.string().trim().min(2, "Name must contain at least 2 characters."),
  password: z.string().min(10, "Password must contain at least 10 characters."),
  role_ids: uniquePositiveIntegerStringArraySchema.optional().default([]),
  status: userStatusSchema.optional(),
  user_type: userTypeSchema.optional(),
});

export const updateUserSchema = createUserSchema.omit({ password: true });

export const updateUserStatusSchema = z.object({
  allow_login: z.boolean().optional(),
  status: userStatusSchema,
});

export const changeUserPasswordSchema = z
  .object({
    password: z.string().min(10, "Password must contain at least 10 characters."),
    confirmPassword: z.string().min(1, "Confirm the password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const assignUserRolesSchema = z.object({
  role_ids: uniquePositiveIntegerStringArraySchema,
});

export const assignUserBranchesSchema = z.object({
  branch_ids: uniquePositiveIntegerStringArraySchema,
});
