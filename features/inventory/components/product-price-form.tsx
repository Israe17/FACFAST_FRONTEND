"use client";

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

import type { CreateProductPriceInput, PriceList } from "../types";
import { FormFieldError } from "./form-field-error";

type ProductPriceFormProps = {
  form: UseFormReturn<CreateProductPriceInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateProductPriceInput) => Promise<void> | void;
  priceLists: PriceList[];
  submitLabel: string;
};

function ProductPriceForm({
  form,
  formError,
  isPending,
  onSubmit,
  priceLists,
  submitLabel,
}: ProductPriceFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="product-price-price-list">{t("inventory.entity.price_list")}</Label>
          <Controller
            control={form.control}
            name="price_list_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="product-price-price-list">
                  <SelectValue placeholder={t("inventory.form.select_price_list")} />
                </SelectTrigger>
                <SelectContent>
                  {priceLists.map((priceList) => (
                    <SelectItem key={priceList.id} value={priceList.id}>
                      {priceList.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.price_list_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price-price">{t("inventory.form.price")}</Label>
          <Input
            id="product-price-price"
            min={0}
            step="0.0001"
            type="number"
            {...form.register("price", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.price?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="product-price-min-quantity">{t("inventory.form.min_quantity")}</Label>
          <Input
            id="product-price-min-quantity"
            min={0}
            step="0.0001"
            type="number"
            {...form.register("min_quantity", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.min_quantity?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price-valid-from">{t("inventory.form.valid_from")}</Label>
          <Input id="product-price-valid-from" type="datetime-local" {...form.register("valid_from")} />
          <FormFieldError message={errors.valid_from?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price-valid-to">{t("inventory.form.valid_to")}</Label>
          <Input id="product-price-valid-to" type="datetime-local" {...form.register("valid_to")} />
          <FormFieldError message={errors.valid_to?.message} />
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
          <p className="font-medium">{t("inventory.form.active_product_price")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_product_price_description")}
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

export { ProductPriceForm };
export type { ProductPriceFormProps };
