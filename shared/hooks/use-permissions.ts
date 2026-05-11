"use client";

import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/shared/lib/permissions";
import { isTenantContextPlatformAdmin } from "@/features/auth/utils";

import { useKnownPermissionKeys } from "./use-permissions-catalog";
import { useSession } from "./use-session";

// Process-global de-dup: a typoed permission would otherwise spam the
// console on every render. We only want to surface each unique offender
// once per session.
const warnedPermissions = new Set<string>();

function devWarnIfUnknown(
  catalog: Set<string> | null,
  permission: string,
): void {
  if (process.env.NODE_ENV === "production") return;
  if (!permission) return;
  // Catalog not loaded yet (login flicker, slow network) — do nothing
  // rather than warning on every check.
  if (!catalog) return;
  if (catalog.has(permission)) return;
  if (warnedPermissions.has(permission)) return;
  warnedPermissions.add(permission);
  // eslint-disable-next-line no-console
  console.warn(
    `[permissions] can("${permission}") references a permission that is not ` +
      `defined in the system catalog (${catalog.size} known). Either you have ` +
      `a typo, or the permission has not been seeded by the backend yet. ` +
      `See GET /permissions for the authoritative list.`,
  );
}

export function usePermissions() {
  const { user } = useSession();
  const catalog = useKnownPermissionKeys();
  const permissions = user?.permissions ?? [];
  const roles = user?.roles ?? [];
  const hasTenantContextAccess = isTenantContextPlatformAdmin(user);

  return {
    hasTenantContextAccess,
    permissions,
    roles,
    can: (permission: string) => {
      devWarnIfUnknown(catalog, permission);
      return hasTenantContextAccess
        ? true
        : hasPermission(permissions, permission);
    },
    canAny: (requiredPermissions: string[]) => {
      for (const permission of requiredPermissions) {
        devWarnIfUnknown(catalog, permission);
      }
      return hasTenantContextAccess
        ? true
        : hasAnyPermission(permissions, requiredPermissions);
    },
    canAll: (requiredPermissions: string[]) => {
      for (const permission of requiredPermissions) {
        devWarnIfUnknown(catalog, permission);
      }
      return hasTenantContextAccess
        ? true
        : hasAllPermissions(permissions, requiredPermissions);
    },
    hasRole: (role: string) => roles.includes(role),
    hasAnyRole: (requiredRoles: string[]) =>
      requiredRoles.some((role) => roles.includes(role)),
  };
}
