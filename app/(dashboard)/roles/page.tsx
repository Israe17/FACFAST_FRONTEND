"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Plus, ShieldCheck, Users } from "lucide-react";

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
import { DataCard } from "@/shared/components/data-card";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { PageHeader } from "@/shared/components/page-header";
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
      for (const roleId of user.role_ids) {
        const key = String(roleId);
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
      <PageHeader
        actions={
          canCreateRoles ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />
              {t("roles.create_button")}
            </Button>
          ) : null
        }
        description={t("roles.page_description")}
        eyebrow={t("roles.page_eyebrow")}
        title={t("roles.access_control_title")}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DataCard
          icon={<ShieldCheck className="size-5" aria-hidden="true" />}
          title={t("roles.kpi.roles_title")}
          value={roles.length}
        />
        <DataCard
          icon={<Users className="size-5" aria-hidden="true" />}
          title={t("roles.kpi.users_title")}
          value={canViewUsers ? totalUsers : "—"}
          description={
            canViewUsers ? undefined : t("roles.kpi.users_permission_required")
          }
        />
        <DataCard
          icon={<Boxes className="size-5" aria-hidden="true" />}
          title={t("roles.kpi.modules_title")}
          value={canViewPermissions ? moduleCount : "—"}
          description={
            canViewPermissions
              ? t("roles.kpi.modules_description", {
                  count: String(permissionsQuery.data?.length ?? 0),
                })
              : t("roles.kpi.permissions_permission_required")
          }
        />
      </div>

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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <aside className="space-y-3">
            {canCreateRoles ? (
              <Button
                className="w-full"
                onClick={() => setCreateDialogOpen(true)}
                variant="default"
              >
                <Plus className="size-4" />
                {t("roles.create_custom_button")}
              </Button>
            ) : null}

            <ul className="space-y-2">
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
