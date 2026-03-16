"use client";

import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateRoleDialog } from "@/features/roles/components/create-role-dialog";
import { RolesTable } from "@/features/roles/components/roles-table";
import { useAvailablePermissionsQuery, useRolesQuery } from "@/features/roles/queries";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { PageHeader } from "@/shared/components/page-header";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

export default function RolesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { can } = usePermissions();
  const { isTenantContextMode, isTenantMode } = usePlatformMode();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const rolesQuery = useRolesQuery(can("roles.view") && canRunTenantQueries);
  const permissionsQuery = useAvailablePermissionsQuery(
    canRunTenantQueries && can("permissions.view"),
  );

  if (!can("roles.view")) {
    return (
      <ErrorState
        description="You do not have permission to view roles."
        title="Access denied"
      />
    );
  }

  return (
    <>
      <PageHeader
        actions={
          can("roles.create") ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />
              Create role
            </Button>
          ) : null
        }
        description="Manage roles, edit metadata and assign permission sets for RBAC."
        eyebrow="Administration"
        title="Roles"
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Roles source: /api/roles</Badge>
        <Badge variant="outline">
          Permissions catalog:{" "}
          {permissionsQuery.data?.length ?? (permissionsQuery.isSuccess ? 0 : "loading")}
        </Badge>
      </div>

      {rolesQuery.isLoading ? <LoadingState description="Loading roles." /> : null}
      {rolesQuery.isError ? (
        <ErrorState
          description={getBackendErrorMessage(rolesQuery.error, "Unable to load roles.")}
          onRetry={() => rolesQuery.refetch()}
        />
      ) : null}
      {rolesQuery.data?.length === 0 ? (
        <EmptyState
          action={
            can("roles.create") ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                Create role
              </Button>
            ) : null
          }
          description="Create the first role to start structuring RBAC."
          icon={ShieldCheck}
          title="No roles found"
        />
      ) : null}
      {rolesQuery.data?.length ? <RolesTable data={rolesQuery.data} /> : null}

      <CreateRoleDialog onOpenChange={setCreateDialogOpen} open={createDialogOpen} />
    </>
  );
}
