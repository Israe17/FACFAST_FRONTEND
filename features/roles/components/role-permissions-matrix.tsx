"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Boxes,
  Building2,
  ClipboardList,
  Cog,
  Lock,
  Package,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ActionButton } from "@/shared/components/action-button";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import { useAssignRolePermissionsMutation, useAvailablePermissionsQuery } from "../queries";
import type { PermissionDefinition, Role } from "../types";

const MODULE_ICONS: Record<string, LucideIcon> = {
  general: Cog,
  auth: ShieldCheck,
  branches: Building2,
  contacts: Users,
  users: Users,
  roles: ShieldCheck,
  permissions: ShieldCheck,
  inventory: Package,
  products: Package,
  product_serials: BadgeCheck,
  warehouses: Warehouse,
  warehouse_locations: Warehouse,
  warehouse_stock: Boxes,
  inventory_lots: Boxes,
  inventory_movements: Truck,
  dispatch_orders: Truck,
  zones: Truck,
  vehicles: Truck,
  routes: Truck,
  promotions: ClipboardList,
  price_lists: ClipboardList,
  product_prices: ClipboardList,
  tax_profiles: ClipboardList,
};

function pickModuleIcon(moduleKey: string): LucideIcon {
  return MODULE_ICONS[moduleKey] ?? Cog;
}

function formatModuleLabel(moduleKey: string): string {
  return moduleKey
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type RolePermissionsMatrixProps = {
  role: Role;
  canEdit: boolean;
};

export function RolePermissionsMatrix({ role, canEdit }: RolePermissionsMatrixProps) {
  const { t } = useAppTranslator();
  const permissionsQuery = useAvailablePermissionsQuery(true);
  const assignPermissionsMutation = useAssignRolePermissionsMutation(role.id, {
    showErrorToast: false,
  });

  const baselineIds = useMemo(
    () => new Set(role.permissions.map((permission) => permission.id)),
    [role.permissions],
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set(baselineIds));

  useEffect(() => {
    setSelectedIds(new Set(baselineIds));
  }, [baselineIds]);

  const editable = canEdit && !role.is_system;

  const groupedPermissions = useMemo(() => {
    const items = permissionsQuery.data ?? [];
    const groups = new Map<string, PermissionDefinition[]>();
    for (const permission of items) {
      const moduleKey = permission.module ?? "general";
      const existing = groups.get(moduleKey);
      if (existing) {
        existing.push(permission);
      } else {
        groups.set(moduleKey, [permission]);
      }
    }
    return Array.from(groups.entries())
      .map(([moduleKey, permissions]) => ({
        moduleKey,
        permissions: permissions
          .slice()
          .sort((a, b) => (a.action ?? a.key).localeCompare(b.action ?? b.key)),
      }))
      .sort((a, b) => a.moduleKey.localeCompare(b.moduleKey));
  }, [permissionsQuery.data]);

  const dirty = useMemo(() => {
    if (selectedIds.size !== baselineIds.size) {
      return true;
    }
    for (const id of selectedIds) {
      if (!baselineIds.has(id)) {
        return true;
      }
    }
    return false;
  }, [baselineIds, selectedIds]);

  function togglePermission(permissionId: number, next: boolean) {
    setSelectedIds((current) => {
      const updated = new Set(current);
      if (next) {
        updated.add(permissionId);
      } else {
        updated.delete(permissionId);
      }
      return updated;
    });
  }

  function handleReset() {
    setSelectedIds(new Set(baselineIds));
  }

  async function handleSave() {
    try {
      await assignPermissionsMutation.mutateAsync({
        permission_ids: Array.from(selectedIds),
      });
    } catch (error) {
      presentBackendErrorToast(error, {
        fallbackMessage: t("roles.permissions_update_error_fallback"),
      });
    }
  }

  if (permissionsQuery.isLoading) {
    return <LoadingState description={t("roles.matrix.loading")} />;
  }

  if (permissionsQuery.isError) {
    return (
      <ErrorState
        description={getBackendErrorMessage(
          permissionsQuery.error,
          t("roles.matrix.load_error_fallback"),
        )}
        onRetry={() => permissionsQuery.refetch()}
      />
    );
  }

  if (!permissionsQuery.data?.length) {
    return (
      <EmptyState
        title={t("roles.matrix.empty_title")}
        description={t("roles.matrix.empty_description")}
      />
    );
  }

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("roles.matrix.title")}</h3>
        <p className="text-xs text-muted-foreground">
          {role.is_system
            ? t("roles.matrix.system_lock_hint")
            : t("roles.matrix.edit_hint")}
        </p>
      </header>

      <div className="space-y-3">
        {groupedPermissions.map(({ moduleKey, permissions }) => {
          const Icon = pickModuleIcon(moduleKey);
          const moduleLabel = formatModuleLabel(moduleKey);
          const activeInModule = permissions.filter((permission) =>
            selectedIds.has(permission.id),
          ).length;

          return (
            <section
              key={moduleKey}
              className="space-y-2 rounded-xl border border-border/70 bg-background p-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {moduleLabel}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  ·{" "}
                  {t("roles.matrix.module_count", {
                    active: String(activeInModule),
                    total: String(permissions.length),
                  })}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {permissions.map((permission) => {
                  const checked = selectedIds.has(permission.id);
                  const inputId = `role-${role.id}-permission-${permission.id}`;
                  return (
                    <label
                      key={permission.id}
                      htmlFor={inputId}
                      className={`flex items-center gap-2 rounded-lg border border-border/60 px-2.5 py-1.5 transition-colors ${
                        editable ? "cursor-pointer hover:bg-muted/40" : "cursor-default"
                      }`}
                    >
                      <Switch
                        id={inputId}
                        checked={checked}
                        disabled={!editable}
                        onCheckedChange={(value) =>
                          togglePermission(permission.id, value === true)
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {permission.action ?? permission.key}
                        </p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {permission.key}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {role.is_system ? (
        <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 p-2.5 text-xs text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <p>{t("roles.matrix.system_lock_message")}</p>
        </div>
      ) : null}

      {editable && dirty ? (
        <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
          <p className="text-sm font-medium">{t("roles.matrix.unsaved_changes")}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={assignPermissionsMutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <ActionButton
              size="sm"
              isLoading={assignPermissionsMutation.isPending}
              loadingText={t("common.saving")}
              onClick={handleSave}
              type="button"
            >
              {t("roles.matrix.save_changes")}
            </ActionButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
