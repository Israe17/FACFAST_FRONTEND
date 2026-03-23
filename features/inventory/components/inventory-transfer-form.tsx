"use client";

import { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
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
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type {
  CreateInventoryTransferInput,
  InventoryLot,
  Product,
  Warehouse,
} from "../types";
import { useProductSerialsQuery, useProductVariantsQuery } from "../queries";
import { FormFieldError } from "./form-field-error";
import { EMPTY_SELECT_VALUE } from "./inventory-adjustment-form";
import { VariantPicker } from "./variant-picker";

export type InventoryTransferFormProps = {
  destinationLocations: Array<{ id: string; name: string }>;
  form: UseFormReturn<CreateInventoryTransferInput>;
  formError?: string | null;
  isPending?: boolean;
  lots: InventoryLot[];
  onSubmit: (values: CreateInventoryTransferInput) => Promise<void> | void;
  originLocations: Array<{ id: string; name: string }>;
  products: Product[];
  submitLabel: string;
  warehouses: Warehouse[];
};

export function InventoryTransferForm({
  destinationLocations,
  form,
  formError,
  isPending,
  lots,
  onSubmit,
  originLocations,
  products,
  submitLabel,
  warehouses,
}: InventoryTransferFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;

  const inventoryLotId = form.watch("inventory_lot_id") ?? "";
  const watchedProductId = form.watch("product_id") ?? "";
  const watchedVariantId = form.watch("product_variant_id") ?? "";
  const selectedProduct = products.find((product) => product.id === watchedProductId);
  const operationalProducts = products.filter(
    (product) => product.is_active && product.type === "product" && product.track_inventory,
  );
  const { data: productVariants = [] } = useProductVariantsQuery(
    watchedProductId,
    Boolean(selectedProduct?.has_variants),
  );
  const selectedVariant = productVariants.find((variant) => variant.id === watchedVariantId);
  const requiresLot = selectedProduct?.has_variants
    ? Boolean(selectedVariant?.track_lots)
    : Boolean(selectedProduct?.track_lots);
  const requiresSerials = Boolean(selectedProduct?.track_serials);
  const originWarehouseId = form.watch("origin_warehouse_id") ?? "";

  const effectiveVariantId = watchedVariantId || (
    selectedProduct?.has_variants === false
      ? selectedProduct.variants.find((v) => v.is_default)?.id ?? ""
      : ""
  );

  const serialsQuery = useProductSerialsQuery(
    watchedProductId,
    effectiveVariantId,
    { status: "available", warehouse_id: originWarehouseId },
    requiresSerials && Boolean(watchedProductId) && Boolean(effectiveVariantId) && Boolean(originWarehouseId),
  );

  const availableSerials = useMemo(
    () => serialsQuery.data ?? [],
    [serialsQuery.data],
  );

  useEffect(() => {
    const defaultVariantId =
      selectedProduct?.has_variants === false
        ? selectedProduct.variants.find((variant) => variant.is_default)?.id ?? ""
        : "";

    form.setValue("product_variant_id", defaultVariantId, { shouldDirty: true });
    form.setValue("inventory_lot_id", "", { shouldDirty: true });
    form.setValue("serial_ids", [], { shouldDirty: true });
  }, [form, selectedProduct, watchedProductId]);

  useEffect(() => {
    if (!requiresLot && inventoryLotId) {
      form.setValue("inventory_lot_id", "", { shouldDirty: true });
    }
  }, [form, inventoryLotId, requiresLot]);

  useEffect(() => {
    if (!requiresSerials && (form.getValues("serial_ids")?.length ?? 0) > 0) {
      form.setValue("serial_ids", [], { shouldDirty: true });
    }
  }, [form, requiresSerials]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  {warehouses.filter((warehouse) => warehouse.is_active).map((warehouse) => (
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
                  {warehouses.filter((warehouse) => warehouse.is_active).map((warehouse) => (
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
                  {operationalProducts.map((product) => (
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

        <VariantPicker
          form={form}
          name="product_variant_id"
          productId={watchedProductId}
          products={products}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="inventory-transfer-origin-location">{t("inventory.form.origin_location")}</Label>
          <Controller
            control={form.control}
            name="origin_location_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="inventory-transfer-origin-location">
                  <SelectValue placeholder={t("inventory.form.no_location")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>{t("inventory.form.no_location")}</SelectItem>
                  {originLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.origin_location_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-transfer-destination-location">
            {t("inventory.form.destination_location")}
          </Label>
          <Controller
            control={form.control}
            name="destination_location_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="inventory-transfer-destination-location">
                  <SelectValue placeholder={t("inventory.form.no_location")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>{t("inventory.form.no_location")}</SelectItem>
                  {destinationLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.destination_location_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-transfer-lot">{t("inventory.entity.inventory_lot")}</Label>
          <Controller
            control={form.control}
            name="inventory_lot_id"
            render={({ field }) => (
              <Select
                disabled={!requiresLot}
                onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="inventory-transfer-lot">
                  <SelectValue placeholder={t("inventory.form.no_inventory_lot")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    {t("inventory.form.no_inventory_lot")}
                  </SelectItem>
                  {lots
                    .filter((lot) => lot.is_active)
                    .map((lot) => (
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

      {requiresSerials ? (
        <div className="space-y-2">
          <Label>{t("inventory.form.serial_ids")}</Label>
          {!originWarehouseId ? (
            <p className="text-sm text-muted-foreground">
              {t("inventory.serials.select_origin_warehouse_hint")}
            </p>
          ) : serialsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : availableSerials.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("inventory.serials.no_available_serials")}
            </p>
          ) : (
            <Controller
              control={form.control}
              name="serial_ids"
              render={({ field }) => {
                const selectedIds = new Set(field.value ?? []);
                return (
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border/70 p-3">
                    {availableSerials.map((serial) => (
                      <label key={serial.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedIds.has(Number(serial.id))}
                          onCheckedChange={(checked) => {
                            const numId = Number(serial.id);
                            const next = checked
                              ? [...(field.value ?? []), numId]
                              : (field.value ?? []).filter((id: number) => id !== numId);
                            field.onChange(next);
                            form.setValue("quantity", next.length || 1, { shouldDirty: true });
                          }}
                        />
                        <span className="font-mono">{serial.serial_number}</span>
                        {serial.warehouse?.name ? (
                          <span className="text-muted-foreground">— {serial.warehouse.name}</span>
                        ) : null}
                      </label>
                    ))}
                  </div>
                );
              }}
            />
          )}
          <FormFieldError message={errors.serial_ids?.message} />
          {(form.watch("serial_ids")?.length ?? 0) > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("inventory.serials.selected_count", {
                count: form.watch("serial_ids")?.length ?? 0,
              })}
            </p>
          ) : null}
        </div>
      ) : null}

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
