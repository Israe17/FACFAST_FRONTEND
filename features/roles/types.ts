import type { z } from "zod/v4";

import {
  assignRolePermissionsSchema,
  createRoleSchema,
  permissionDefinitionSchema,
  roleSchema,
  updateRoleSchema,
} from "./schemas";

export type Role = z.infer<typeof roleSchema>;
export type PermissionDefinition = z.infer<typeof permissionDefinitionSchema>;

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignRolePermissionsInput = z.infer<typeof assignRolePermissionsSchema>;
