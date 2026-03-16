"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

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
  CreateInventoryAdjustmentInput,
  InventoryLot,
  Product,
  Warehouse,
} from "../types";
import { FormFieldError } from "./form-field-error";

export const EMPTY_SELECT_VALUE = "__none__";

export type InventoryAdjustmentFormProps = {
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

export function InventoryAdjustmentForm({
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
