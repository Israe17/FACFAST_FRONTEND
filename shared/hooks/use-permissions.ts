"use client";

import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/shared/lib/permissions";
import { isTenantContextPlatformAdmin } from "@/features/auth/utils";

import { useSession } from "./use-session";

export function usePermissions() {
  const { user } = useSession();
  const permissions = user?.permissions ?? [];
  const roles = user?.roles ?? [];
  const hasTenantContextAccess = isTenantContextPlatformAdmin(user);

  return {
    hasTenantContextAccess,
    permissions,
    roles,
    can: (permission: string) =>
      hasTenantContextAccess ? true : hasPermission(permissions, permission),
    canAny: (requiredPermissions: string[]) =>
      hasTenantContextAccess ? true : hasAnyPermission(permissions, requiredPermissions),
    canAll: (requiredPermissions: string[]) =>
      hasTenantContextAccess ? true : hasAllPermissions(permissions, requiredPermissions),
    hasRole: (role: string) => roles.includes(role),
    hasAnyRole: (requiredRoles: string[]) => requiredRoles.some((role) => roles.includes(role)),
  };
}
