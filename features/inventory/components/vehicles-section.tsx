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

import { useVehiclesQuery, useDeleteVehicleMutation } from "../queries";
import type { Vehicle } from "../types";
import { VehicleDialog } from "./vehicle-dialog";
import { getVehiclesColumns } from "./vehicles-columns";
import { CatalogSectionCard } from "./catalog-section-card";

type VehiclesSectionProps = {
  enabled?: boolean;
};

function VehiclesSection({ enabled = true }: VehiclesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("vehicles.view");
  const canCreate = can("vehicles.create");
  const canUpdate = can("vehicles.update");
  const canDelete = can("vehicles.delete");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const vehiclesQuery = useVehiclesQuery(enabled && canView);
  const deleteMutation = useDeleteVehicleMutation({ showErrorToast: true });

  const handleEdit = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const columns = useMemo(
    () =>
      getVehiclesColumns({
        canDelete,
        canUpdate,
        onDelete: setDeleteTarget,
        onEdit: handleEdit,
        t,
      }),
    [canDelete, canUpdate, handleEdit, t],
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
                setSelectedVehicle(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", { entity: t("inventory.entity.vehicle") })}
            </Button>
          ) : null
        }
        description={t("inventory.vehicles.section_description")}
        title={t("inventory.entity.vehicles")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            vehiclesQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.vehicles"),
            }),
          )}
          isError={vehiclesQuery.isError}
          isLoading={vehiclesQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.vehicles"),
          })}
          onRetry={() => vehiclesQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={vehiclesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.vehicles"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <VehicleDialog
        vehicle={selectedVehicle}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedVehicle(null);
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
            <AlertDialogTitle>{t("inventory.vehicles.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.vehicles.delete_description", { name: deleteTarget?.name ?? "" })}
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
    </>
  );
}

export { VehiclesSection };
