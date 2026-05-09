"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { UpdateWarehouseStockThresholdsInput } from "../types";
import { FormFieldError } from "./form-field-error";

export type WarehouseStockThresholdsFormProps = {
  form: UseFormReturn<UpdateWarehouseStockThresholdsInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: UpdateWarehouseStockThresholdsInput) => Promise<void> | void;
  submitLabel: string;
};

export function WarehouseStockThresholdsForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: WarehouseStockThresholdsFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warehouse-stock-min">
            {t("inventory.warehouse_stock.min_stock_label")}
          </Label>
          <Input
            id="warehouse-stock-min"
            type="number"
            min={0}
            step="0.0001"
            placeholder={t("inventory.warehouse_stock.threshold_value_placeholder")}
            {...form.register("min_stock")}
          />
          <FormFieldError message={errors.min_stock?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouse-stock-max">
            {t("inventory.warehouse_stock.max_stock_label")}
          </Label>
          <Input
            id="warehouse-stock-max"
            type="number"
            min={0}
            step="0.0001"
            placeholder={t("inventory.warehouse_stock.threshold_value_placeholder")}
            {...form.register("max_stock")}
          />
          <FormFieldError message={errors.max_stock?.message} />
        </div>
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}
