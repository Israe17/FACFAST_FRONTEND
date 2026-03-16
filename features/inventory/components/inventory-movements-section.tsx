"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ArrowRightLeft, Ban, Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/shared/components/action-button";
import { DataTable } from "@/shared/components/data-table";
import { ErrorState } from "@/shared/components/error-state";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { formatDateTime } from "@/shared/lib/utils";
import { getInventoryMovementRoute } from "@/shared/lib/routes";

import {
  emptyInventoryAdjustmentFormValues,
  emptyInventoryTransferFormValues,
} from "../form-values";
import {
  useCancelInventoryMovementMutation,
  useCreateInventoryAdjustmentMutation,
  useCreateInventoryTransferMutation,
  useInventoryLotsQuery,
  useInventoryMovementsQuery,
  useProductsQuery,
  useWarehouseLocationsQuery,
  useWarehousesQuery,
} from "../queries";
import {
  cancelInventoryMovementSchema,
  createInventoryAdjustmentSchema,
  createInventoryTransferSchema,
} from "../schemas";
import type {
  CancelInventoryMovementInput,
  CreateInventoryAdjustmentInput,
  CreateInventoryTransferInput,
  InventoryLot,
  InventoryMovementRow,
  Product,
  Warehouse,
} from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

const EMPTY_SELECT_VALUE = "__none__";

type InventoryMovementsSectionProps = {
  enabled?: boolean;
};

type InventoryAdjustmentFormProps = {
  form: UseFormReturn<CreateInventoryAdjustmentInput>;
  formError?: string | null;
  isPending?: boolean;
  locations: Array<{ id: string; name: string }>;
  lots: InventoryLot[];
  onSubmit: (values: CreateInventoryAdjustmentInput) => Promise<void> | void;
  products: Product[];
  submitLabel: string;
  warehouses: Warehouse[];
};

function InventoryAdjustmentForm({
  form,
  formError,
  isPending,
  locations,
  lots,
  onSubmit,
  products,
  submitLabel,
  warehouses,
}: InventoryAdjustmentFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const selectedProduct = products.find((product) => product.id === form.watch("product_id"));
  const movementType = form.watch("movement_type");

  useEffect(() => {
    if (!selectedProduct?.track_lots && form.getValues("inventory_lot_id")) {
      form.setValue("inventory_lot_id", "", { shouldDirty: true });
    }
  }, [form, selectedProduct?.track_lots]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="inventory-adjustment-warehouse">{t("inventory.entity.warehouse")}</Label>
          <Controller
            control={form.control}
            name="warehouse_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="inventory-adjustment-warehouse">
                  <SelectValue placeholder={t("inventory.form.select_warehouse")} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.warehouse_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-adjustment-location">{t("inventory.entity.warehouse_location")}</Label>
          <Controller
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="inventory-adjustment-location">
                  <SelectValue placeholder={t("inventory.form.no_location")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>{t("inventory.form.no_location")}</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.location_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-adjustment-product">{t("inventory.form.product")}</Label>
          <Controller
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="inventory-adjustment-product">
                  <SelectValue placeholder={t("inventory.form.select_product")} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.product_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-adjustment-type">{t("inventory.form.adjustment_type")}</Label>
          <Controller
            control={form.control}
            name="movement_type"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="inventory-adjustment-type">
                  <SelectValue placeholder={t("inventory.form.select_adjustment_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjustment_in">{t("inventory.enum.adjustment_type.adjustment_in")}</SelectItem>
                  <SelectItem value="adjustment_out">{t("inventory.enum.adjustment_type.adjustment_out")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.movement_type?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="inventory-adjustment-lot">{t("inventory.entity.inventory_lot")}</Label>
          <Controller
            control={form.control}
            name="inventory_lot_id"
            render={({ field }) => (
              <Select
                disabled={!selectedProduct?.track_lots}
                onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="inventory-adjustment-lot">
                  <SelectValue placeholder={t("inventory.form.no_inventory_lot")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    {t("inventory.form.no_inventory_lot")}
                  </SelectItem>
                  {lots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.lot_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.inventory_lot_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-adjustment-quantity">{t("inventory.form.quantity")}</Label>
          <Input
            id="inventory-adjustment-quantity"
            min={0.0001}
            step="0.0001"
            type="number"
            {...form.register("quantity", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.quantity?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-adjustment-reference-type">{t("inventory.form.reference_type")}</Label>
          <Input id="inventory-adjustment-reference-type" {...form.register("reference_type")} />
          <FormFieldError message={errors.reference_type?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-adjustment-reference-id">{t("inventory.form.reference_id")}</Label>
          <Input
            id="inventory-adjustment-reference-id"
            min={1}
            step="1"
            type="number"
            {...form.register("reference_id", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.reference_id?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inventory-adjustment-notes">{t("inventory.common.notes")}</Label>
        <Textarea id="inventory-adjustment-notes" {...form.register("notes")} />
        <FormFieldError message={errors.notes?.message} />
      </div>

      <div className="rounded-xl border border-border/70 p-3 text-sm text-muted-foreground">
        {movementType === "adjustment_out"
          ? t("inventory.inventory_movements.adjustment_out_hint")
          : t("inventory.inventory_movements.adjustment_in_hint")}
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

type InventoryTransferFormProps = {
  form: UseFormReturn<CreateInventoryTransferInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateInventoryTransferInput) => Promise<void> | void;
  products: Product[];
  submitLabel: string;
  warehouses: Warehouse[];
};

function InventoryTransferForm({
  form,
  formError,
  isPending,
  onSubmit,
  products,
  submitLabel,
  warehouses,
}: InventoryTransferFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="inventory-transfer-origin">{t("inventory.form.origin_warehouse")}</Label>
          <Controller
            control={form.control}
            name="origin_warehouse_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="inventory-transfer-origin">
                  <SelectValue placeholder={t("inventory.form.select_origin_warehouse")} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.origin_warehouse_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-transfer-destination">{t("inventory.form.destination_warehouse")}</Label>
          <Controller
            control={form.control}
            name="destination_warehouse_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="inventory-transfer-destination">
                  <SelectValue placeholder={t("inventory.form.select_destination_warehouse")} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.destination_warehouse_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-transfer-product">{t("inventory.form.product")}</Label>
          <Controller
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="inventory-transfer-product">
                  <SelectValue placeholder={t("inventory.form.select_product")} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.product_id?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="inventory-transfer-quantity">{t("inventory.form.quantity")}</Label>
          <Input
            id="inventory-transfer-quantity"
            min={0.0001}
            step="0.0001"
            type="number"
            {...form.register("quantity", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.quantity?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-transfer-unit-cost">{t("inventory.form.unit_cost")}</Label>
          <Input
            id="inventory-transfer-unit-cost"
            min={0}
            step="0.0001"
            type="number"
            {...form.register("unit_cost", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.unit_cost?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-transfer-reference-type">{t("inventory.form.reference_type")}</Label>
          <Input id="inventory-transfer-reference-type" {...form.register("reference_type")} />
          <FormFieldError message={errors.reference_type?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-transfer-reference-id">{t("inventory.form.reference_id")}</Label>
          <Input
            id="inventory-transfer-reference-id"
            min={1}
            step="1"
            type="number"
            {...form.register("reference_id", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.reference_id?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inventory-transfer-notes">{t("inventory.common.notes")}</Label>
        <Textarea id="inventory-transfer-notes" {...form.register("notes")} />
        <FormFieldError message={errors.notes?.message} />
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

type CancelMovementDialogProps = {
  movement?: InventoryMovementRow | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function CancelMovementDialog({ movement, onOpenChange, open }: CancelMovementDialogProps) {
  const headerId = movement?.header_id ?? "";
  const cancelMutation = useCancelInventoryMovementMutation(headerId, { showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<CancelInventoryMovementInput>({
    defaultValues: { notes: "" },
    resolver: buildFormResolver<CancelInventoryMovementInput>(cancelInventoryMovementSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    form.reset({ notes: "" });
    resetBackendFormErrors();
  }, [form, movement, open, resetBackendFormErrors]);

  async function handleSubmit(values: CancelInventoryMovementInput) {
    resetBackendFormErrors();

    try {
      await cancelMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("inventory.inventory_movement_cancel_error_fallback"),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("inventory.inventory_movements.cancel_title")}</DialogTitle>
          <DialogDescription>
            {t("inventory.inventory_movements.cancel_description", {
              code: movement?.code ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormErrorBanner message={formError} />
          <div className="space-y-2">
            <Label htmlFor="inventory-movement-cancel-notes">{t("inventory.common.notes")}</Label>
            <Textarea id="inventory-movement-cancel-notes" {...form.register("notes")} />
            <FormFieldError message={form.formState.errors.notes?.message} />
          </div>
          <div className="flex justify-end">
            <ActionButton
              isLoading={cancelMutation.isPending}
              loadingText={t("common.saving")}
              type="submit"
            >
              {t("inventory.inventory_movements.cancel_action")}
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InventoryMovementsSection({ enabled = true }: InventoryMovementsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("inventory_movements.view");
  const canAdjust = can("inventory_movements.adjust");
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovementRow | null>(null);
  const movementsQuery = useInventoryMovementsQuery(enabled && canView);
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

  const columns = useMemo<ColumnDef<InventoryMovementRow>[]>(
    () => {
      const baseColumns: ColumnDef<InventoryMovementRow>[] = [
        {
          accessorKey: "code",
          header: t("inventory.entity.inventory_movement"),
          cell: ({ row }) => (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{row.original.code ?? row.original.id}</p>
                {row.original.status ? (
                  <Badge variant="outline">
                    {t(`inventory.enum.inventory_movement_status.${row.original.status}` as const)}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {row.original.header_id
                  ? `${t("inventory.form.header_id")}: ${row.original.header_id}`
                  : `${t("inventory.common.code")}: ${row.original.id}`}
              </p>
            </div>
          ),
        },
        {
          accessorKey: "movement_type",
          header: t("inventory.form.movement_type"),
          cell: ({ row }) =>
            row.original.movement_type
              ? t(`inventory.enum.ledger_movement_type.${row.original.movement_type}` as const)
              : t("inventory.common.not_available"),
        },
        {
          accessorKey: "warehouse",
          header: t("inventory.entity.warehouse"),
          cell: ({ row }) => row.original.warehouse.name,
        },
        {
          accessorKey: "product",
          header: t("inventory.form.product"),
          cell: ({ row }) => (
            <div className="space-y-1 text-sm">
              <p>{row.original.product.name}</p>
              <p className="text-muted-foreground">
                {row.original.product_variant?.sku ?? t("inventory.common.not_available")}
              </p>
            </div>
          ),
        },
        {
          accessorKey: "quantity",
          header: t("inventory.form.quantity"),
          cell: ({ row }) => (
            <div className="space-y-1 text-sm">
              <p>{row.original.quantity ?? 0}</p>
              <p className="text-muted-foreground">
                {t("inventory.form.on_hand_delta")}: {row.original.on_hand_delta ?? 0}
              </p>
            </div>
          ),
        },
        {
          accessorKey: "occurred_at",
          header: t("inventory.form.occurred_at"),
          cell: ({ row }) => <span>{formatDateTime(row.original.occurred_at)}</span>,
        },
      ];

      if (canAdjust || canView) {
        baseColumns.push({
          id: "actions",
          header: t("inventory.common.actions"),
          cell: ({ row }) => {
            const isPrimaryLine = !row.original.line_no || row.original.line_no === 1;

            if (!isPrimaryLine || !row.original.header_id) {
              return null;
            }

            return (
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={getInventoryMovementRoute(row.original.header_id)}>
                    <Eye className="size-4" />
                    {t("inventory.common.view")}
                  </Link>
                </Button>
                {canAdjust && row.original.status === "posted" ? (
                  <Button
                    onClick={() => {
                      setSelectedMovement(row.original);
                      setCancelOpen(true);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Ban className="size-4" />
                    {t("inventory.inventory_movements.cancel_action")}
                  </Button>
                ) : null}
              </div>
            );
          },
        });
      }

      return baseColumns;
    },
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
        {movementsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.inventory_movements"),
            })}
          />
        ) : null}
        {movementsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              movementsQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.inventory_movements"),
              }),
            )}
            onRetry={() => movementsQuery.refetch()}
          />
        ) : null}
        {!movementsQuery.isLoading && !movementsQuery.isError ? (
          <DataTable
            columns={columns}
            data={movementsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.inventory_movements"),
            })}
          />
        ) : null}
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
