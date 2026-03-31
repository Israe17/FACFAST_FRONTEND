"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "@/features/users/components/create-user-dialog";
import { UsersTable } from "@/features/users/components/users-table";
import { useAssignableBranchesQuery, useUsersQuery } from "@/features/users/queries";
import { useRolesQuery } from "@/features/roles/queries";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";

export default function UsersPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { activeBranchId, isBusinessLevelContext } = useActiveBranch();
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const { isTenantContextMode, isTenantMode } = usePlatformMode();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const usersQuery = useUsersQuery(can("users.view") && canRunTenantQueries);
  // Prefetch catalogs for row-action dialogs (assign roles, assign branches)
  useRolesQuery(can("roles.view") && canRunTenantQueries);
  useAssignableBranchesQuery(can("users.view") && canRunTenantQueries);

  if (!can("users.view")) {
    return (
      <ErrorState
        description="You do not have permission to view users."
        title="Access denied"
      />
    );
  }

  return (
    <>
      <PageHeader
        actions={
          can("users.create") ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />
              Create user
            </Button>
          ) : null
        }
        description="Manage users, statuses, passwords, roles, branches and effective permissions."
        eyebrow="Administration"
        title="Users"
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          Active branch: {isBusinessLevelContext ? "Company level" : (activeBranchId ?? "None")}
        </Badge>
        <Badge variant="outline">Query source: /api/users</Badge>
      </div>

      {usersQuery.isLoading ? <LoadingState description="Loading users." /> : null}
      {usersQuery.isError ? (
        <ErrorState
          description={getTranslatedBackendErrorMessage(usersQuery.error, {
            fallbackMessage: t("common.load_failed"),
            translateMessage: t,
          }) ?? undefined}
          onRetry={() => usersQuery.refetch()}
        />
      ) : null}
      {usersQuery.data?.length === 0 ? (
        <EmptyState
          action={
            can("users.create") ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                Create user
              </Button>
            ) : null
          }
          description="Create the first user record for this business."
          icon={Users}
          title="No users found"
        />
      ) : null}
      {usersQuery.data?.length ? <UsersTable data={usersQuery.data} /> : null}

      <CreateUserDialog onOpenChange={setCreateDialogOpen} open={createDialogOpen} />
    </>
  );
}
