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
  CreateInventoryTransferInput,
  Product,
  Warehouse,
} from "../types";
import { FormFieldError } from "./form-field-error";
import { VariantPicker } from "./variant-picker";

export type InventoryTransferFormProps = {
  form: UseFormReturn<CreateInventoryTransferInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateInventoryTransferInput) => Promise<void> | void;
  products: Product[];
  submitLabel: string;
  warehouses: Warehouse[];
};

export function InventoryTransferForm({
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

  const watchedProductId = form.watch("product_id");

  useEffect(() => {
    form.setValue("product_variant_id", "", { shouldDirty: true });
  }, [form, watchedProductId]);

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

        <VariantPicker
          form={form}
          name="product_variant_id"
          productId={watchedProductId}
          products={products}
        />
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
