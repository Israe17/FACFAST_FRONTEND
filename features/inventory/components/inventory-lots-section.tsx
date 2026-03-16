"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

import { useContactsQuery } from "@/features/contacts/queries";
import type { Contact } from "@/features/contacts/types";

import {
  emptyInventoryLotFormValues,
  getInventoryLotFormValues,
} from "../form-values";
import {
  useCreateInventoryLotMutation,
  useInventoryLotsQuery,
  useProductsQuery,
  useUpdateInventoryLotMutation,
  useWarehouseLocationsQuery,
  useWarehousesQuery,
} from "../queries";
import { createInventoryLotSchema } from "../schemas";
import type { CreateInventoryLotInput, InventoryLot, Product, Warehouse } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

const EMPTY_SELECT_VALUE = "__none__";

type InventoryLotsSectionProps = {
  enabled?: boolean;
};

type InventoryLotFormProps = {
  form: UseFormReturn<CreateInventoryLotInput>;
  formError?: string | null;
  isEditing?: boolean;
  isPending?: boolean;
  locations: { id: string; name: string }[];
  products: Product[];
  submitLabel: string;
  suppliers: Contact[];
  warehouses: Warehouse[];
  onSubmit: (values: CreateInventoryLotInput) => Promise<void> | void;
};

function InventoryLotForm({
  form,
  formError,
  isEditing = false,
  isPending,
  locations,
  onSubmit,
  products,
  submitLabel,
  suppliers,
  warehouses,
}: InventoryLotFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="inventory-lot-code">{t("inventory.common.code")}</Label>
          <Input id="inventory-lot-code" placeholder="LT-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-lot-warehouse">{t("inventory.entity.warehouse")}</Label>
          <Controller
            control={form.control}
            name="warehouse_id"
            render={({ field }) => (
              <Select
                disabled={isEditing}
                onValueChange={field.onChange}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="inventory-lot-warehouse">
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
          <Label htmlFor="inventory-lot-product">{t("inventory.form.product")}</Label>
          <Controller
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <Select
                disabled={isEditing}
                onValueChange={field.onChange}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="inventory-lot-product">
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
          <Label htmlFor="inventory-lot-number">{t("inventory.form.lot_number")}</Label>
          <Input id="inventory-lot-number" {...form.register("lot_number")} />
          <FormFieldError message={errors.lot_number?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-lot-location">{t("inventory.entity.warehouse_location")}</Label>
          <Controller
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="inventory-lot-location">
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
          <Label htmlFor="inventory-lot-expiration-date">{t("inventory.form.expiration_date")}</Label>
          <Input id="inventory-lot-expiration-date" type="date" {...form.register("expiration_date")} />
          <FormFieldError message={errors.expiration_date?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-lot-manufacturing-date">{t("inventory.form.manufacturing_date")}</Label>
          <Input
            id="inventory-lot-manufacturing-date"
            type="date"
            {...form.register("manufacturing_date")}
          />
          <FormFieldError message={errors.manufacturing_date?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="inventory-lot-received-at">{t("inventory.form.received_at")}</Label>
          <Input id="inventory-lot-received-at" type="datetime-local" {...form.register("received_at")} />
          <FormFieldError message={errors.received_at?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-lot-initial-quantity">{t("inventory.form.initial_quantity")}</Label>
          <Input
            disabled={isEditing}
            id="inventory-lot-initial-quantity"
            min={0}
            step="0.0001"
            type="number"
            {...form.register("initial_quantity", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.initial_quantity?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-lot-unit-cost">{t("inventory.form.unit_cost")}</Label>
          <Input
            id="inventory-lot-unit-cost"
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
          <Label htmlFor="inventory-lot-supplier">{t("inventory.form.supplier_contact")}</Label>
          <Controller
            control={form.control}
            name="supplier_contact_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="inventory-lot-supplier">
                  <SelectValue placeholder={t("inventory.form.no_supplier_contact")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    {t("inventory.form.no_supplier_contact")}
                  </SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.supplier_contact_id?.message} />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("inventory.form.active_inventory_lot")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_inventory_lot_description")}
          </p>
        </div>
      </label>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

type InventoryLotDialogProps = {
  lot?: InventoryLot | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  products: Product[];
  suppliers: Contact[];
  warehouses: Warehouse[];
};

function InventoryLotDialog({
  lot,
  onOpenChange,
  open,
  products,
  suppliers,
  warehouses,
}: InventoryLotDialogProps) {
  const createMutation = useCreateInventoryLotMutation({ showErrorToast: false });
  const updateMutation = useUpdateInventoryLotMutation(lot?.id ?? "", { showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<CreateInventoryLotInput>({
    defaultValues: lot ? getInventoryLotFormValues(lot) : emptyInventoryLotFormValues,
    resolver: buildFormResolver<CreateInventoryLotInput>(createInventoryLotSchema),
  });
  const watchedWarehouseId = useWatch({
    control: form.control,
    name: "warehouse_id",
  });
  const locationsQuery = useWarehouseLocationsQuery(
    watchedWarehouseId,
    open && Boolean(watchedWarehouseId),
  );
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = lot ? updateMutation : createMutation;

  useEffect(() => {
    form.reset(lot ? getInventoryLotFormValues(lot) : emptyInventoryLotFormValues);
    resetBackendFormErrors();
  }, [form, lot, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateInventoryLotInput) {
    resetBackendFormErrors();

    try {
      if (lot) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          lot
            ? "inventory.inventory_lot_update_error_fallback"
            : "inventory.inventory_lot_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {lot
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.inventory_lot"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.inventory_lot"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.inventory_lots.dialog_description")}</DialogDescription>
        </DialogHeader>
        <InventoryLotForm
          form={form}
          formError={formError}
          isEditing={Boolean(lot)}
          isPending={activeMutation.isPending}
          locations={(locationsQuery.data ?? []).map((location) => ({
            id: location.id,
            name: location.name,
          }))}
          onSubmit={handleSubmit}
          products={products}
          submitLabel={
            lot
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.inventory_lot"),
                })
          }
          suppliers={suppliers}
          warehouses={warehouses}
        />
      </DialogContent>
    </Dialog>
  );
}

function InventoryLotsSection({ enabled = true }: InventoryLotsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("inventory_lots.view");
  const canCreate = can("inventory_lots.create");
  const canUpdate = can("inventory_lots.update");
  const canViewContacts = can("contacts.view");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<InventoryLot | null>(null);
  const inventoryLotsQuery = useInventoryLotsQuery(enabled && canView);
  const warehousesQuery = useWarehousesQuery(enabled && canView);
  const productsQuery = useProductsQuery(enabled && canView);
  const contactsQuery = useContactsQuery(enabled && canView && canViewContacts);
  const lotEnabledProducts = useMemo(
    () => (productsQuery.data ?? []).filter((product) => product.track_lots),
    [productsQuery.data],
  );
  const supplierContacts = useMemo(
    () =>
      (contactsQuery.data ?? []).filter(
        (contact) => contact.type === "supplier" || contact.type === "both",
      ),
    [contactsQuery.data],
  );

  const columns = useMemo<ColumnDef<InventoryLot>[]>(
    () => {
      const baseColumns: ColumnDef<InventoryLot>[] = [
        {
          accessorKey: "lot_number",
          header: t("inventory.entity.inventory_lot"),
          cell: ({ row }) => (
            <div className="space-y-1">
              <p className="font-medium">{row.original.lot_number}</p>
              <p className="text-sm text-muted-foreground">
                {row.original.code
                  ? `${t("inventory.common.code")}: ${row.original.code}`
                  : t("inventory.common.no_manual_code")}
              </p>
            </div>
          ),
        },
        {
          accessorKey: "product",
          header: t("inventory.form.product"),
          cell: ({ row }) => row.original.product.name,
        },
        {
          accessorKey: "warehouse",
          header: t("inventory.entity.warehouse"),
          cell: ({ row }) => (
            <div className="space-y-1 text-sm">
              <p>{row.original.warehouse.name}</p>
              <p className="text-muted-foreground">
                {row.original.location?.name ?? t("inventory.form.no_location")}
              </p>
            </div>
          ),
        },
        {
          accessorKey: "current_quantity",
          header: t("inventory.form.current_quantity"),
          cell: ({ row }) => row.original.current_quantity ?? 0,
        },
        {
          accessorKey: "expiration_date",
          header: t("inventory.form.expiration_date"),
          cell: ({ row }) => row.original.expiration_date ?? t("inventory.common.not_available"),
        },
        {
          accessorKey: "updated_at",
          header: t("inventory.common.updated"),
          cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
        },
      ];

      if (canUpdate) {
        baseColumns.push({
          id: "actions",
          header: t("inventory.common.actions"),
          cell: ({ row }) => (
            <Button
              onClick={() => {
                setSelectedLot(row.original);
                setDialogOpen(true);
              }}
              size="sm"
              variant="outline"
            >
              <Pencil className="size-4" />
              {t("inventory.common.edit")}
            </Button>
          ),
        });
      }

      return baseColumns;
    },
    [canUpdate, t],
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
                setSelectedLot(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.inventory_lot"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.inventory_lots.section_description")}
        title={t("inventory.entity.inventory_lots")}
      >
        {inventoryLotsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.inventory_lots"),
            })}
          />
        ) : null}
        {inventoryLotsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              inventoryLotsQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.inventory_lots"),
              }),
            )}
            onRetry={() => inventoryLotsQuery.refetch()}
          />
        ) : null}
        {!inventoryLotsQuery.isLoading && !inventoryLotsQuery.isError ? (
          <DataTable
            columns={columns}
            data={inventoryLotsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.inventory_lots"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <InventoryLotDialog
        lot={selectedLot}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedLot(null);
          }
        }}
        open={dialogOpen}
        products={lotEnabledProducts}
        suppliers={supplierContacts}
        warehouses={warehousesQuery.data ?? []}
      />
    </>
  );
}

export { InventoryLotsSection };
