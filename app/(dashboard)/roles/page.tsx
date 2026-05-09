"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Plus, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateRoleDialog } from "@/features/roles/components/create-role-dialog";
import { RoleDetailPanel } from "@/features/roles/components/role-detail-panel";
import { RoleListCard } from "@/features/roles/components/role-list-card";
import {
  useAvailablePermissionsQuery,
  useDeleteRoleMutation,
  useRolesQuery,
} from "@/features/roles/queries";
import type { Role } from "@/features/roles/types";
import { useUsersQuery } from "@/features/users/queries";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";

function countModules(permissions: { module?: string }[] = []): number {
  const modules = new Set<string>();
  for (const permission of permissions) {
    modules.add(permission.module ?? "general");
  }
  return modules.size;
}

type Stat = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
};

function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex items-stretch divide-x divide-border/70 rounded-xl border border-border/70 bg-background">
      {stats.map(({ icon: Icon, label, value, hint }) => (
        <div
          key={label}
          className="flex min-w-[7.5rem] flex-1 items-center gap-2.5 px-3 py-2"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="flex items-baseline gap-1.5 leading-none">
              <span className="text-xl font-semibold">{value}</span>
              {hint ? (
                <span className="truncate text-[11px] font-normal text-muted-foreground">
                  {hint}
                </span>
              ) : null}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RolesPage() {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const { isTenantContextMode, isTenantMode } = usePlatformMode();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const canViewRoles = can("roles.view");
  const canCreateRoles = can("roles.create");
  const canUpdateRoles = can("roles.update");
  const canDeleteRoles = can("roles.delete");
  const canViewPermissions = can("permissions.view");
  const canViewUsers = can("users.view");

  const rolesQuery = useRolesQuery(canViewRoles && canRunTenantQueries);
  const permissionsQuery = useAvailablePermissionsQuery(
    canRunTenantQueries && canViewPermissions,
  );
  const usersQuery = useUsersQuery(canRunTenantQueries && canViewUsers);
  const deleteRoleMutation = useDeleteRoleMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const roles = rolesQuery.data ?? [];

  const userCountByRole = useMemo(() => {
    const counts = new Map<string, number>();
    for (const user of usersQuery.data ?? []) {
      const seen = new Set<string>();
      for (const role of user.roles ?? []) {
        seen.add(String(role.id));
      }
      for (const roleId of user.role_ids ?? []) {
        seen.add(String(roleId));
      }
      for (const key of seen) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return counts;
  }, [usersQuery.data]);

  useEffect(() => {
    if (!roles.length) {
      if (selectedRoleId !== null) {
        setSelectedRoleId(null);
      }
      return;
    }
    if (!selectedRoleId || !roles.some((role) => String(role.id) === selectedRoleId)) {
      setSelectedRoleId(String(roles[0].id));
    }
  }, [roles, selectedRoleId]);

  if (!canViewRoles) {
    return (
      <ErrorState
        description={t("roles.page_access_denied")}
        title={t("common.access_denied_title")}
      />
    );
  }

  const selectedRole =
    roles.find((role) => String(role.id) === selectedRoleId) ?? null;
  const selectedUserCount = selectedRole
    ? userCountByRole.get(String(selectedRole.id)) ?? 0
    : 0;
  const totalUsers = usersQuery.data?.length ?? 0;
  const totalPermissions = permissionsQuery.data?.length ?? 0;
  const moduleCount = countModules(permissionsQuery.data ?? []);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await deleteRoleMutation.mutateAsync(deleteTarget.id);
    if (selectedRoleId === String(deleteTarget.id)) {
      setSelectedRoleId(null);
    }
    setDeleteTarget(null);
  }

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("roles.page_eyebrow")}
          </p>
          <h1 className="text-xl font-semibold sm:text-2xl">
            {t("roles.access_control_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("roles.page_description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatsBar
            stats={[
              {
                icon: ShieldCheck,
                label: t("roles.kpi.roles_title"),
                value: roles.length,
              },
              {
                icon: Users,
                label: t("roles.kpi.users_title"),
                value: canViewUsers ? totalUsers : "—",
              },
              {
                icon: Boxes,
                label: t("roles.kpi.modules_title"),
                value: canViewPermissions ? moduleCount : "—",
                hint:
                  canViewPermissions && totalPermissions > 0
                    ? t("roles.kpi.modules_short_hint", {
                        count: String(totalPermissions),
                      })
                    : undefined,
              },
            ]}
          />

          {canCreateRoles ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />
              {t("roles.create_custom_button")}
            </Button>
          ) : null}
        </div>
      </header>

      {rolesQuery.isLoading ? <LoadingState description={t("roles.loading")} /> : null}
      {rolesQuery.isError ? (
        <ErrorState
          description={
            getTranslatedBackendErrorMessage(rolesQuery.error, {
              fallbackMessage: t("roles.load_error_fallback"),
              translateMessage: t,
            }) ?? undefined
          }
          onRetry={() => rolesQuery.refetch()}
        />
      ) : null}
      {!rolesQuery.isLoading && !rolesQuery.isError && roles.length === 0 ? (
        <EmptyState
          action={
            canCreateRoles ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                {t("roles.create_button")}
              </Button>
            ) : null
          }
          description={t("roles.empty_description")}
          icon={ShieldCheck}
          title={t("roles.empty_title")}
        />
      ) : null}

      {roles.length ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <aside className="lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-1">
            <ul className="space-y-1.5">
              {roles.map((role) => (
                <li key={role.id}>
                  <RoleListCard
                    role={role}
                    selected={String(role.id) === selectedRoleId}
                    userCount={userCountByRole.get(String(role.id)) ?? 0}
                    onSelect={(next) => setSelectedRoleId(String(next.id))}
                  />
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-w-0">
            {selectedRole ? (
              <RoleDetailPanel
                canDelete={canDeleteRoles}
                canUpdate={canUpdateRoles}
                canViewUsers={canViewUsers}
                onRequestDelete={setDeleteTarget}
                role={selectedRole}
                userCount={selectedUserCount}
              />
            ) : (
              <EmptyState
                icon={ShieldCheck}
                title={t("roles.select_role_title")}
                description={t("roles.select_role_description")}
              />
            )}
          </div>
        </div>
      ) : null}

      <CreateRoleDialog onOpenChange={setCreateDialogOpen} open={createDialogOpen} />
      <ConfirmDialog
        confirmLabel={t("roles.delete_confirm")}
        description={
          deleteTarget
            ? t("roles.delete_description", { name: deleteTarget.name })
            : ""
        }
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        open={deleteTarget !== null}
        title={t("roles.delete_title")}
      />
    </>
  );
}
