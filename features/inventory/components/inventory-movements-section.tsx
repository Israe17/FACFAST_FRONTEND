"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ArrowRightLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useServerTableState } from "@/shared/hooks/use-server-table-state";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import {
  emptyInventoryAdjustmentFormValues,
  emptyInventoryTransferFormValues,
} from "../form-values";
import {
  useCreateInventoryAdjustmentMutation,
  useCreateInventoryTransferMutation,
  useInventoryLotsQuery,
  useInventoryMovementsPaginatedQuery,
  useProductsQuery,
  useWarehouseLocationsQuery,
  useWarehousesQuery,
} from "../queries";
import {
  createInventoryAdjustmentSchema,
  createInventoryTransferSchema,
} from "../schemas";
import type {
  CreateInventoryAdjustmentInput,
  CreateInventoryTransferInput,
  InventoryMovementRow,
} from "../types";
import { CancelMovementDialog } from "./cancel-movement-dialog";
import { CatalogSectionCard } from "./catalog-section-card";
import { InventoryAdjustmentForm } from "./inventory-adjustment-form";
import { getInventoryMovementsColumns } from "./inventory-movements-columns";
import { InventoryTransferForm } from "./inventory-transfer-form";

type InventoryMovementsSectionProps = {
  enabled?: boolean;
};

function InventoryMovementsSection({ enabled = true }: InventoryMovementsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("inventory_movements.view");
  const canAdjust = can("inventory_movements.adjust");
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovementRow | null>(null);
  const { serverState, onStateChange, queryParams } = useServerTableState({ sort_order: "DESC" });
  const movementsQuery = useInventoryMovementsPaginatedQuery(queryParams, enabled && canView);
  const warehousesQuery = useWarehousesQuery(enabled && canView);
  const productsQuery = useProductsQuery(enabled && canView);
  const lotsQuery = useInventoryLotsQuery((adjustmentOpen || enabled) && canView);
  const inventoryProducts = useMemo(
    () => (productsQuery.data ?? []).filter((product) => product.track_inventory),
    [productsQuery.data],
  );

  const adjustmentForm = useForm<CreateInventoryAdjustmentInput>({
    defaultValues: emptyInventoryAdjustmentFormValues,
    resolver: buildFormResolver<CreateInventoryAdjustmentInput>(createInventoryAdjustmentSchema),
  });
  const adjustmentWarehouseId = useWatch({
    control: adjustmentForm.control,
    name: "warehouse_id",
  });
  const adjustmentProductId = useWatch({
    control: adjustmentForm.control,
    name: "product_id",
  });
  const adjustmentLocationsQuery = useWarehouseLocationsQuery(
    adjustmentWarehouseId,
    adjustmentOpen && Boolean(adjustmentWarehouseId),
  );
  const adjustmentMutation = useCreateInventoryAdjustmentMutation({ showErrorToast: false });
  const {
    formError: adjustmentFormError,
    handleBackendFormError: handleAdjustmentBackendError,
    resetBackendFormErrors: resetAdjustmentBackendErrors,
  } = useBackendFormErrors(adjustmentForm);

  const transferForm = useForm<CreateInventoryTransferInput>({
    defaultValues: emptyInventoryTransferFormValues,
    resolver: buildFormResolver<CreateInventoryTransferInput>(createInventoryTransferSchema),
  });
  const transferMutation = useCreateInventoryTransferMutation({ showErrorToast: false });
  const {
    formError: transferFormError,
    handleBackendFormError: handleTransferBackendError,
    resetBackendFormErrors: resetTransferBackendErrors,
  } = useBackendFormErrors(transferForm);

  useEffect(() => {
    if (!adjustmentOpen) {
      adjustmentForm.reset(emptyInventoryAdjustmentFormValues);
      resetAdjustmentBackendErrors();
    }
  }, [adjustmentForm, adjustmentOpen, resetAdjustmentBackendErrors]);

  useEffect(() => {
    if (!transferOpen) {
      transferForm.reset(emptyInventoryTransferFormValues);
      resetTransferBackendErrors();
    }
  }, [resetTransferBackendErrors, transferForm, transferOpen]);

  const filteredLots = useMemo(
    () =>
      (lotsQuery.data ?? []).filter((lot) => {
        const sameWarehouse = !adjustmentWarehouseId || lot.warehouse.id === adjustmentWarehouseId;
        const sameProduct = !adjustmentProductId || lot.product.id === adjustmentProductId;
        return sameWarehouse && sameProduct;
      }),
    [adjustmentProductId, adjustmentWarehouseId, lotsQuery.data],
  );

  async function handleAdjustmentSubmit(values: CreateInventoryAdjustmentInput) {
    resetAdjustmentBackendErrors();

    const selectedProduct = inventoryProducts.find((product) => product.id === values.product_id);
    if (selectedProduct?.track_lots && !values.inventory_lot_id) {
      adjustmentForm.setError("inventory_lot_id", {
        message: t("inventory.inventory_movements.inventory_lot_required"),
      });
      return;
    }

    try {
      await adjustmentMutation.mutateAsync(values);
      setAdjustmentOpen(false);
    } catch (error) {
      handleAdjustmentBackendError(error, {
        fallbackMessage: t("inventory.inventory_adjustment_create_error_fallback"),
      });
    }
  }

  async function handleTransferSubmit(values: CreateInventoryTransferInput) {
    resetTransferBackendErrors();

    try {
      await transferMutation.mutateAsync(values);
      setTransferOpen(false);
    } catch (error) {
      handleTransferBackendError(error, {
        fallbackMessage: t("inventory.inventory_transfer_create_error_fallback"),
      });
    }
  }

  const columns = useMemo(
    () =>
      getInventoryMovementsColumns({
        canAdjust,
        canView,
        t,
        onCancel: (m) => {
          setSelectedMovement(m);
          setCancelOpen(true);
        },
      }),
    [canAdjust, canView, t],
  );

  if (!canView) {
    return null;
  }

  return (
    <>
      <CatalogSectionCard
        action={
          canAdjust ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setAdjustmentOpen(true)} variant="outline">
                <Plus className="size-4" />
                {t("inventory.inventory_movements.new_adjustment")}
              </Button>
              <Button onClick={() => setTransferOpen(true)}>
                <ArrowRightLeft className="size-4" />
                {t("inventory.inventory_movements.new_transfer")}
              </Button>
            </div>
          ) : null
        }
        description={t("inventory.inventory_movements.section_description")}
        title={t("inventory.entity.inventory_movements")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            movementsQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.inventory_movements"),
            }),
          )}
          isError={movementsQuery.isError}
          isLoading={movementsQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.inventory_movements"),
          })}
          onRetry={() => movementsQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={movementsQuery.data?.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.inventory_movements"),
            })}
            onServerStateChange={onStateChange}
            serverSide
            serverState={serverState}
            total={movementsQuery.data?.total ?? 0}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <Dialog onOpenChange={setAdjustmentOpen} open={adjustmentOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t("inventory.inventory_movements.new_adjustment")}</DialogTitle>
            <DialogDescription>
              {t("inventory.inventory_movements.adjustment_dialog_description")}
            </DialogDescription>
          </DialogHeader>
          <InventoryAdjustmentForm
            form={adjustmentForm}
            formError={adjustmentFormError}
            isPending={adjustmentMutation.isPending}
            locations={(adjustmentLocationsQuery.data ?? []).map((location) => ({
              id: location.id,
              name: location.name,
            }))}
            lots={filteredLots}
            onSubmit={handleAdjustmentSubmit}
            products={inventoryProducts}
            submitLabel={t("inventory.inventory_movements.create_adjustment")}
            warehouses={warehousesQuery.data ?? []}
          />
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setTransferOpen} open={transferOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t("inventory.inventory_movements.new_transfer")}</DialogTitle>
            <DialogDescription>
              {t("inventory.inventory_movements.transfer_dialog_description")}
            </DialogDescription>
          </DialogHeader>
          <InventoryTransferForm
            form={transferForm}
            formError={transferFormError}
            isPending={transferMutation.isPending}
            onSubmit={handleTransferSubmit}
            products={inventoryProducts}
            submitLabel={t("inventory.inventory_movements.create_transfer")}
            warehouses={warehousesQuery.data ?? []}
          />
        </DialogContent>
      </Dialog>

      <CancelMovementDialog
        movement={selectedMovement}
        onOpenChange={(open) => {
          setCancelOpen(open);
          if (!open) {
            setSelectedMovement(null);
          }
        }}
        open={cancelOpen}
      />
    </>
  );
}

export { InventoryMovementsSection };
