"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ArrowRightLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  useProductVariantsQuery,
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
  InventoryMovementHeader,
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
  const canTransfer = can("inventory_movements.transfer");
  const canCancel = can("inventory_movements.cancel");
  const canViewProducts = can("products.view");
  const canViewWarehouses = can("warehouses.view");
  const canViewLots = can("inventory_lots.view");
  const canViewLocations = can("warehouse_locations.view");
  const canViewVariants = can("product_variants.view");
  const canOpenAdjustmentForm = canAdjust && canViewProducts && canViewWarehouses && canViewVariants;
  const canOpenTransferForm = canTransfer && canViewProducts && canViewWarehouses && canViewVariants;
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovementHeader | null>(null);
  const { serverState, onStateChange, queryParams } = useServerTableState({ sort_order: "DESC" });
  const movementsQuery = useInventoryMovementsPaginatedQuery(queryParams, enabled && canView);
  const warehousesQuery = useWarehousesQuery(
    (adjustmentOpen || transferOpen) && canViewWarehouses,
  );
  const productsQuery = useProductsQuery((adjustmentOpen || transferOpen) && canViewProducts);
  const lotsQuery = useInventoryLotsQuery((adjustmentOpen || transferOpen) && canViewLots);
  const inventoryProducts = useMemo(
    () =>
      (productsQuery.data ?? []).filter(
        (product) => product.is_active && product.type === "product" && product.track_inventory,
      ),
    [productsQuery.data],
  );

  const adjustmentForm = useForm<CreateInventoryAdjustmentInput>({
    defaultValues: emptyInventoryAdjustmentFormValues,
    resolver: buildFormResolver<CreateInventoryAdjustmentInput>(createInventoryAdjustmentSchema),
  });
  const adjustmentWarehouseId = useWatch({
    control: adjustmentForm.control,
    name: "warehouse_id",
  }) ?? "";
  const adjustmentProductId = useWatch({
    control: adjustmentForm.control,
    name: "product_id",
  }) ?? "";
  const adjustmentVariantId = useWatch({
    control: adjustmentForm.control,
    name: "product_variant_id",
  }) ?? "";
  const adjustmentSelectedProduct = inventoryProducts.find((product) => product.id === adjustmentProductId);
  const { data: adjustmentProductVariants = [] } = useProductVariantsQuery(
    adjustmentProductId,
    adjustmentOpen && canViewVariants && Boolean(adjustmentSelectedProduct?.has_variants),
  );
  const adjustmentSelectedVariant = adjustmentProductVariants.find(
    (variant) => variant.id === adjustmentVariantId,
  );
  const adjustmentRequiresLot = adjustmentSelectedProduct?.has_variants
    ? Boolean(adjustmentSelectedVariant?.track_lots)
    : Boolean(adjustmentSelectedProduct?.track_lots);
  const adjustmentLocationsQuery = useWarehouseLocationsQuery(
    adjustmentWarehouseId,
    adjustmentOpen && canViewLocations && Boolean(adjustmentWarehouseId),
  );
  const adjustmentLocations = useMemo(
    () =>
      (adjustmentLocationsQuery.data ?? [])
        .filter((location) => location.is_active)
        .map((location) => ({
          id: location.id,
          name: location.name,
        })),
    [adjustmentLocationsQuery.data],
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
  const transferOriginWarehouseId = useWatch({
    control: transferForm.control,
    name: "origin_warehouse_id",
  }) ?? "";
  const transferDestinationWarehouseId = useWatch({
    control: transferForm.control,
    name: "destination_warehouse_id",
  }) ?? "";
  const transferProductId = useWatch({
    control: transferForm.control,
    name: "product_id",
  }) ?? "";
  const transferVariantId = useWatch({
    control: transferForm.control,
    name: "product_variant_id",
  }) ?? "";
  const transferSelectedProduct = inventoryProducts.find((product) => product.id === transferProductId);
  const { data: transferProductVariants = [] } = useProductVariantsQuery(
    transferProductId,
    transferOpen && canViewVariants && Boolean(transferSelectedProduct?.has_variants),
  );
  const transferSelectedVariant = transferProductVariants.find((variant) => variant.id === transferVariantId);
  const transferRequiresLot = transferSelectedProduct?.has_variants
    ? Boolean(transferSelectedVariant?.track_lots)
    : Boolean(transferSelectedProduct?.track_lots);
  const transferRequiresSerials = Boolean(transferSelectedProduct?.track_serials);
  const transferOriginLocationsQuery = useWarehouseLocationsQuery(
    transferOriginWarehouseId,
    transferOpen && canViewLocations && Boolean(transferOriginWarehouseId),
  );
  const transferDestinationLocationsQuery = useWarehouseLocationsQuery(
    transferDestinationWarehouseId,
    transferOpen && canViewLocations && Boolean(transferDestinationWarehouseId),
  );
  const transferOriginLocations = useMemo(
    () =>
      (transferOriginLocationsQuery.data ?? [])
        .filter((location) => location.is_active)
        .map((location) => ({
          id: location.id,
          name: location.name,
        })),
    [transferOriginLocationsQuery.data],
  );
  const transferDestinationLocations = useMemo(
    () =>
      (transferDestinationLocationsQuery.data ?? [])
        .filter((location) => location.is_active)
        .map((location) => ({
          id: location.id,
          name: location.name,
        })),
    [transferDestinationLocationsQuery.data],
  );
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
        const sameVariant = !adjustmentVariantId || lot.product_variant?.id === adjustmentVariantId;
        return lot.is_active && sameWarehouse && sameProduct && sameVariant;
      }),
    [adjustmentProductId, adjustmentVariantId, adjustmentWarehouseId, lotsQuery.data],
  );
  const transferFilteredLots = useMemo(
    () =>
      (lotsQuery.data ?? []).filter((lot) => {
        const sameWarehouse =
          !transferOriginWarehouseId || lot.warehouse.id === transferOriginWarehouseId;
        const sameProduct = !transferProductId || lot.product.id === transferProductId;
        const sameVariant =
          !transferVariantId || lot.product_variant?.id === transferVariantId;
        return lot.is_active && sameWarehouse && sameProduct && sameVariant;
      }),
    [lotsQuery.data, transferOriginWarehouseId, transferProductId, transferVariantId],
  );

  async function handleAdjustmentSubmit(values: CreateInventoryAdjustmentInput) {
    resetAdjustmentBackendErrors();

    if (adjustmentSelectedProduct?.has_variants && !values.product_variant_id) {
      adjustmentForm.setError("product_variant_id", {
        message: t("inventory.error.VARIANT_REQUIRED_FOR_MULTI_VARIANT_PRODUCT"),
      });
      return;
    }

    if (adjustmentRequiresLot && !values.inventory_lot_id) {
      adjustmentForm.setError("inventory_lot_id", {
        message: t("inventory.error.INVENTORY_LOT_REQUIRED"),
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

    if (transferSelectedProduct?.has_variants && !values.product_variant_id) {
      transferForm.setError("product_variant_id", {
        message: t("inventory.error.VARIANT_REQUIRED_FOR_MULTI_VARIANT_PRODUCT"),
      });
      return;
    }

    if (transferRequiresLot && !values.inventory_lot_id) {
      transferForm.setError("inventory_lot_id", {
        message: t("inventory.error.INVENTORY_LOT_REQUIRED"),
      });
      return;
    }

    if (transferRequiresSerials) {
      if (!values.serial_ids?.length) {
        transferForm.setError("serial_ids", {
          message: t("inventory.error.SERIALS_REQUIRED_FOR_SERIAL_TRACKED_VARIANT"),
        });
        return;
      }

      if (!Number.isInteger(values.quantity)) {
        transferForm.setError("quantity", {
          message: t("inventory.error.SERIAL_TRANSFER_INTEGER_QUANTITY_REQUIRED"),
        });
        return;
      }

      if (values.serial_ids.length !== values.quantity) {
        transferForm.setError("serial_ids", {
          message: t("inventory.error.SERIAL_TRANSFER_QUANTITY_MISMATCH"),
        });
        return;
      }
    }

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
        canCancel,
        canView,
        t,
        onCancel: (m) => {
          setSelectedMovement(m);
          setCancelOpen(true);
        },
      }),
    [canCancel, canView, t],
  );

  if (!canView) {
    return null;
  }

  return (
    <>
      <CatalogSectionCard
        action={
          canOpenAdjustmentForm || canOpenTransferForm ? (
            <div className="flex flex-wrap gap-2">
              {canOpenAdjustmentForm ? (
                <Button onClick={() => setAdjustmentOpen(true)} variant="outline">
                  <Plus className="size-4" />
                  {t("inventory.inventory_movements.new_adjustment")}
                </Button>
              ) : null}
              {canOpenTransferForm ? (
                <Button onClick={() => setTransferOpen(true)}>
                  <ArrowRightLeft className="size-4" />
                  {t("inventory.inventory_movements.new_transfer")}
                </Button>
              ) : null}
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

      <Sheet onOpenChange={setAdjustmentOpen} open={adjustmentOpen}>
        <SheetContent size="lg">
          <SheetHeader>
            <SheetTitle>{t("inventory.inventory_movements.new_adjustment")}</SheetTitle>
            <SheetDescription>
              {t("inventory.inventory_movements.adjustment_dialog_description")}
            </SheetDescription>
          </SheetHeader>
          <InventoryAdjustmentForm
            form={adjustmentForm}
            formError={adjustmentFormError}
            isPending={adjustmentMutation.isPending}
            locations={adjustmentLocations}
            lots={filteredLots}
            onSubmit={handleAdjustmentSubmit}
            products={inventoryProducts}
            submitLabel={t("inventory.inventory_movements.create_adjustment")}
            warehouses={warehousesQuery.data ?? []}
          />
        </SheetContent>
      </Sheet>

      <Sheet onOpenChange={setTransferOpen} open={transferOpen}>
        <SheetContent size="lg">
          <SheetHeader>
            <SheetTitle>{t("inventory.inventory_movements.new_transfer")}</SheetTitle>
            <SheetDescription>
              {t("inventory.inventory_movements.transfer_dialog_description")}
            </SheetDescription>
          </SheetHeader>
          <InventoryTransferForm
            destinationLocations={transferDestinationLocations}
            form={transferForm}
            formError={transferFormError}
            isPending={transferMutation.isPending}
            lots={transferFilteredLots}
            onSubmit={handleTransferSubmit}
            originLocations={transferOriginLocations}
            products={inventoryProducts}
            submitLabel={t("inventory.inventory_movements.create_transfer")}
            warehouses={warehousesQuery.data ?? []}
          />
        </SheetContent>
      </Sheet>

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
