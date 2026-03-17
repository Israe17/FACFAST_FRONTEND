"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/shared/components/data-table";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import {
  useWarehouseLocationsQuery,
  useWarehousesQuery,
} from "../queries";
import type { WarehouseLocation } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { WarehouseLocationDialog } from "./warehouse-location-dialog";
import { getWarehouseLocationsColumns } from "./warehouse-locations-columns";

type WarehouseLocationsSectionProps = {
  enabled?: boolean;
};

function WarehouseLocationsSection({ enabled = true }: WarehouseLocationsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("warehouse_locations.view");
  const canCreate = can("warehouse_locations.create");
  const canUpdate = can("warehouse_locations.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);
  const warehousesQuery = useWarehousesQuery(enabled && canView);
  const warehouseOptions = useMemo(
    () => (warehousesQuery.data ?? []).filter((warehouse) => warehouse.uses_locations),
    [warehousesQuery.data],
  );
  const resolvedSelectedWarehouseId =
    selectedWarehouseId &&
    warehouseOptions.some((warehouse) => warehouse.id === selectedWarehouseId)
      ? selectedWarehouseId
      : (warehouseOptions[0]?.id ?? "");
  const selectedWarehouse =
    warehouseOptions.find((warehouse) => warehouse.id === resolvedSelectedWarehouseId) ?? null;
  const locationsQuery = useWarehouseLocationsQuery(resolvedSelectedWarehouseId, enabled && canView);

  const onEdit = useCallback((location: WarehouseLocation) => {
    setSelectedLocation(location);
    setDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => getWarehouseLocationsColumns({ canUpdate, onEdit, t }),
    [canUpdate, onEdit, t],
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
              disabled={!selectedWarehouse}
              onClick={() => {
                setSelectedLocation(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.warehouse_location"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.warehouse_locations.section_description")}
        title={t("inventory.entity.warehouse_locations")}
      >
        <div className="max-w-md space-y-2">
          <Label htmlFor="warehouse-locations-warehouse">{t("inventory.entity.warehouse")}</Label>
          <Select onValueChange={setSelectedWarehouseId} value={resolvedSelectedWarehouseId}>
            <SelectTrigger id="warehouse-locations-warehouse">
              <SelectValue placeholder={t("inventory.form.select_warehouse")} />
            </SelectTrigger>
            <SelectContent>
              {warehouseOptions.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {warehousesQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.warehouses"),
            })}
          />
        ) : null}
        {warehousesQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              warehousesQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.warehouses"),
              }),
            )}
            onRetry={() => warehousesQuery.refetch()}
          />
        ) : null}
        {!warehousesQuery.isLoading && !warehousesQuery.isError && !warehouseOptions.length ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            {t("inventory.warehouse_locations.no_warehouses_with_locations")}
          </div>
        ) : null}
        {selectedWarehouse && locationsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.warehouse_locations"),
            })}
          />
        ) : null}
        {selectedWarehouse && locationsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              locationsQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.warehouse_locations"),
              }),
            )}
            onRetry={() => locationsQuery.refetch()}
          />
        ) : null}
        {selectedWarehouse && !locationsQuery.isLoading && !locationsQuery.isError ? (
          <DataTable
            columns={columns}
            data={locationsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.warehouse_locations"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <WarehouseLocationDialog
        location={selectedLocation}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedLocation(null);
          }
        }}
        open={dialogOpen}
        warehouse={selectedWarehouse}
      />
    </>
  );
}

export { WarehouseLocationsSection };
