type PermissionValue = string | string[] | null | undefined;

type PermissionAwareItem = {
  requiredAllPermissions?: string[];
  requiredAnyPermissions?: string[];
};

function normalizePermissions(permissions: string[] | null | undefined) {
  return new Set((permissions ?? []).filter(Boolean));
}

function normalizeRequired(value: PermissionValue) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function hasPermission(permissions: string[] | null | undefined, permission: string) {
  if (!permission) {
    return true;
  }

  return normalizePermissions(permissions).has(permission);
}

export function hasAnyPermission(
  permissions: string[] | null | undefined,
  requiredPermissions: PermissionValue,
) {
  const required = normalizeRequired(requiredPermissions);

  if (!required.length) {
    return true;
  }

  const permissionSet = normalizePermissions(permissions);
  return required.some((permission) => permissionSet.has(permission));
}

export function hasAllPermissions(
  permissions: string[] | null | undefined,
  requiredPermissions: PermissionValue,
) {
  const required = normalizeRequired(requiredPermissions);

  if (!required.length) {
    return true;
  }

  const permissionSet = normalizePermissions(permissions);
  return required.every((permission) => permissionSet.has(permission));
}

export function filterItemsByPermissions<T extends PermissionAwareItem>(
  items: T[],
  permissions: string[] | null | undefined,
) {
  return items.filter((item) => {
    const matchesAll = hasAllPermissions(permissions, item.requiredAllPermissions);
    const matchesAny = hasAnyPermission(permissions, item.requiredAnyPermissions);

    return matchesAll && matchesAny;
  });
}
