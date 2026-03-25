"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import {
  useRoutesQuery,
  useDeleteRouteMutation,
  useRouteBranchAssignmentsQuery,
  useSetRouteBranchAssignmentsMutation,
} from "../queries";
import type { Route, SetBranchAssignmentsInput } from "../types";
import { BranchAssignmentsDialog } from "./branch-assignments-dialog";
import { RouteDialog } from "./route-dialog";
import { getRoutesColumns } from "./routes-columns";
import { CatalogSectionCard } from "./catalog-section-card";

type RoutesSectionProps = {
  enabled?: boolean;
};

function RoutesSection({ enabled = true }: RoutesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("routes.view");
  const canCreate = can("routes.create");
  const canUpdate = can("routes.update");
  const canDelete = can("routes.delete");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null);
  const [branchesTarget, setBranchesTarget] = useState<Route | null>(null);
  const routesQuery = useRoutesQuery(enabled && canView);
  const deleteMutation = useDeleteRouteMutation({ showErrorToast: true });
  const branchAssignmentsQuery = useRouteBranchAssignmentsQuery(
    branchesTarget?.id ?? "",
    branchesTarget !== null,
  );
  const setBranchAssignmentsMutation = useSetRouteBranchAssignmentsMutation(
    branchesTarget?.id ?? "",
    { showErrorToast: true },
  );

  const handleEdit = useCallback((route: Route) => {
    setSelectedRoute(route);
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const handleBranches = useCallback((route: Route) => {
    setBranchesTarget(route);
  }, []);

  const handleSaveBranchAssignments = useCallback(
    async (payload: SetBranchAssignmentsInput) => {
      await setBranchAssignmentsMutation.mutateAsync(payload);
      setBranchesTarget(null);
    },
    [setBranchAssignmentsMutation],
  );

  const columns = useMemo(
    () =>
      getRoutesColumns({
        canDelete,
        canUpdate,
        onBranches: handleBranches,
        onDelete: setDeleteTarget,
        onEdit: handleEdit,
        t,
      }),
    [canDelete, canUpdate, handleBranches, handleEdit, t],
  );

  if (!canView) {
    return null;
  }

  return (
    <>
      <CatalogSectionCard
        action={
          canCreate ? (
            <Button
              onClick={() => {
                setSelectedRoute(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", { entity: t("inventory.entity.route") })}
            </Button>
          ) : null
        }
        description={t("inventory.routes.section_description")}
        title={t("inventory.entity.routes")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            routesQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.routes"),
            }),
          )}
          isError={routesQuery.isError}
          isLoading={routesQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.routes"),
          })}
          onRetry={() => routesQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={routesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.routes"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <RouteDialog
        route={selectedRoute}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedRoute(null);
          }
        }}
        open={dialogOpen}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.routes.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.routes.delete_description", { name: deleteTarget?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              {t("inventory.common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BranchAssignmentsDialog
        assignmentsQuery={branchAssignmentsQuery}
        entityLabel={t("inventory.entity.route")}
        entityName={branchesTarget?.name ?? ""}
        isPending={setBranchAssignmentsMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setBranchesTarget(null);
        }}
        onSave={handleSaveBranchAssignments}
        open={branchesTarget !== null}
      />
    </>
  );
}

export { RoutesSection };
