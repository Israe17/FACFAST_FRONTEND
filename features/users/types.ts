import type { z } from "zod/v4";

import {
  assignUserBranchesSchema,
  assignUserRolesSchema,
  branchOptionSchema,
  changeUserPasswordSchema,
  createUserSchema,
  effectivePermissionsSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userRoleSummarySchema,
  userSchema,
} from "./schemas";

export type User = z.infer<typeof userSchema>;
export type UserRoleSummary = z.infer<typeof userRoleSummarySchema>;
export type BranchOption = z.infer<typeof branchOptionSchema>;
export type EffectivePermissions = z.infer<typeof effectivePermissionsSchema>;

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ChangeUserPasswordInput = z.infer<typeof changeUserPasswordSchema>;
export type AssignUserRolesInput = z.infer<typeof assignUserRolesSchema>;
export type AssignUserBranchesInput = z.infer<typeof assignUserBranchesSchema>;
