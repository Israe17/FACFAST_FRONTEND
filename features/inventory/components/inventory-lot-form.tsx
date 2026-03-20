"use client";

import { useEffect } from "react";
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
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { Contact } from "@/features/contacts/types";

import type { CreateInventoryLotInput, Product, Warehouse } from "../types";
import { FormFieldError } from "./form-field-error";
import { VariantPicker } from "./variant-picker";

const EMPTY_SELECT_VALUE = "__none__";

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
  const watchedProductId = form.watch("product_id") ?? "";
  const selectedProduct = products.find((product) => product.id === watchedProductId);
  const operationalProducts = products.filter(
    (product) =>
      product.is_active &&
      product.type === "product" &&
      product.track_inventory &&
      (product.track_lots || product.has_variants),
  );

  useEffect(() => {
    if (!isEditing) {
      const defaultVariantId =
        selectedProduct?.has_variants === false
          ? selectedProduct.variants.find((variant) => variant.is_default)?.id ?? ""
          : "";

      form.setValue("product_variant_id", defaultVariantId, { shouldDirty: true });
    }
  }, [form, isEditing, selectedProduct, watchedProductId]);

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
                  {warehouses.filter((warehouse) => warehouse.is_active).map((warehouse) => (
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
          disabled={isEditing}
          form={form}
          name="product_variant_id"
          productId={watchedProductId}
          products={products}
        />
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

export { InventoryLotForm };
export type { InventoryLotFormProps };
