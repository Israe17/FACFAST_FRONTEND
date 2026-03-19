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

import { useDeactivateWarehouseMutation, useWarehousesQuery } from "../queries";
import type { Warehouse } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { WarehouseDialog } from "./warehouse-dialog";
import { getWarehousesColumns } from "./warehouses-columns";

type WarehousesSectionProps = {
  enabled?: boolean;
};

function WarehousesSection({ enabled = true }: WarehousesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("warehouses.view");
  const canCreate = can("warehouses.create");
  const canUpdate = can("warehouses.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Warehouse | null>(null);
  const warehousesQuery = useWarehousesQuery(enabled && canView);
  const branchesQuery = useBranchesQuery(enabled && canView);
  const deactivateMutation = useDeactivateWarehouseMutation({ showErrorToast: true });

  const branchNameById = useMemo(
    () =>
      new Map((branchesQuery.data ?? []).map((branch) => [branch.id, branch.name])),
    [branchesQuery.data],
  );

  const handleEdit = useCallback((warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDialogOpen(true);
  }, []);

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateTarget) return;
    await deactivateMutation.mutateAsync(deactivateTarget.id);
    setDeactivateTarget(null);
  }, [deactivateTarget, deactivateMutation]);

  const columns = useMemo(
    () =>
      getWarehousesColumns({
        branchNameById,
        canUpdate,
        canView,
        onDeactivate: setDeactivateTarget,
        onEdit: handleEdit,
        t,
      }),
    [branchNameById, canUpdate, canView, handleEdit, t],
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
                setSelectedWarehouse(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.warehouse"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.warehouses.section_description")}
        title={t("inventory.entity.warehouses")}
      >
        <QueryStateWrapper
          isLoading={warehousesQuery.isLoading}
          isError={warehousesQuery.isError}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.warehouses"),
          })}
          errorDescription={getBackendErrorMessage(
            warehousesQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.warehouses"),
            }),
          )}
          onRetry={() => warehousesQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={warehousesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.warehouses"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <WarehouseDialog
        branches={branchesQuery.data ?? []}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedWarehouse(null);
          }
        }}
        open={dialogOpen}
        warehouse={selectedWarehouse}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null);
        }}
        open={deactivateTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.warehouses.deactivate_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.warehouses.deactivate_description", {
                name: deactivateTarget?.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateConfirm}>
              {t("inventory.common.deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { WarehousesSection };
