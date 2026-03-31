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

import { useBranchesQuery } from "@/features/branches/queries";

import {
  useZonesQuery,
  useDeleteZoneMutation,
  useZoneBranchAssignmentsQuery,
  useSetZoneBranchAssignmentsMutation,
} from "../queries";
import type { SetBranchAssignmentsInput, Zone } from "../types";
import { BranchAssignmentsDialog } from "./branch-assignments-dialog";
import { ZoneDialog } from "./zone-dialog";
import { getZonesColumns } from "./zones-columns";
import { CatalogSectionCard } from "./catalog-section-card";

type ZonesSectionProps = {
  enabled?: boolean;
};

function ZonesSection({ enabled = true }: ZonesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("zones.view");
  const canCreate = can("zones.create");
  const canUpdate = can("zones.update");
  const canDelete = can("zones.delete");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null);
  const [branchesTarget, setBranchesTarget] = useState<Zone | null>(null);
  const branchesQuery = useBranchesQuery(enabled && canView);
  const zonesQuery = useZonesQuery(enabled && canView);
  const deleteMutation = useDeleteZoneMutation({ showErrorToast: true });
  const branchAssignmentsQuery = useZoneBranchAssignmentsQuery(
    branchesTarget?.id ?? "",
    branchesTarget !== null,
  );
  const setBranchAssignmentsMutation = useSetZoneBranchAssignmentsMutation(
    branchesTarget?.id ?? "",
    { showErrorToast: true },
  );

  const handleEdit = useCallback((zone: Zone) => {
    setSelectedZone(zone);
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const handleBranches = useCallback((zone: Zone) => {
    setBranchesTarget(zone);
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
      getZonesColumns({
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
                setSelectedZone(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", { entity: t("inventory.entity.zone") })}
            </Button>
          ) : null
        }
        description={t("inventory.zones.section_description")}
        title={t("inventory.entity.zones")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            zonesQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.zones"),
            }),
          )}
          isError={zonesQuery.isError}
          isLoading={zonesQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.zones"),
          })}
          onRetry={() => zonesQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={zonesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.zones"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <ZoneDialog
        zone={selectedZone}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedZone(null);
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
            <AlertDialogTitle>{t("inventory.zones.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.zones.delete_description", { name: deleteTarget?.name ?? "" })}
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
        branches={branchesQuery.data ?? []}
        entityLabel={t("inventory.entity.zone")}
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

export { ZonesSection };
