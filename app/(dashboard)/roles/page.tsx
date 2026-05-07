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
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";

export default function RolesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { t } = useAppTranslator();
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
        description={t("roles.page_access_denied")}
        title={t("common.access_denied_title")}
      />
    );
  }

  const permissionsCount = permissionsQuery.data?.length ?? (permissionsQuery.isSuccess ? 0 : null);

  return (
    <>
      <PageHeader
        actions={
          can("roles.create") ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />
              {t("roles.create_button")}
            </Button>
          ) : null
        }
        description={t("roles.page_description")}
        eyebrow={t("roles.page_eyebrow")}
        title={t("roles.page_title")}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{t("roles.source_badge")}</Badge>
        <Badge variant="outline">
          {permissionsCount !== null
            ? t("roles.permissions_catalog_badge", { count: String(permissionsCount) })
            : t("roles.permissions_catalog_badge", { count: t("roles.permissions_catalog_loading") })}
        </Badge>
      </div>

      {rolesQuery.isLoading ? <LoadingState description={t("roles.loading")} /> : null}
      {rolesQuery.isError ? (
        <ErrorState
          description={getTranslatedBackendErrorMessage(rolesQuery.error, {
            fallbackMessage: t("roles.load_error_fallback"),
            translateMessage: t,
          }) ?? undefined}
          onRetry={() => rolesQuery.refetch()}
        />
      ) : null}
      {rolesQuery.data?.length === 0 ? (
        <EmptyState
          action={
            can("roles.create") ? (
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
      {rolesQuery.data?.length ? <RolesTable data={rolesQuery.data} /> : null}

      <CreateRoleDialog onOpenChange={setCreateDialogOpen} open={createDialogOpen} />
    </>
  );
}
