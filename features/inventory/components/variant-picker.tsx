"use client";

import { useEffect } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { Product, ProductVariant } from "../types";
import { useProductVariantsQuery } from "../queries";
import { FormFieldError } from "./form-field-error";

type VariantPickerProps<TForm extends FieldValues> = {
  disabled?: boolean;
  form: UseFormReturn<TForm>;
  name: FieldPath<TForm>;
  productId: string;
  products: Product[];
};

export function VariantPicker<TForm extends FieldValues>({
  disabled,
  form,
  name,
  productId,
  products,
}: VariantPickerProps<TForm>) {
  const { t } = useAppTranslator();
  const selectedProduct = products.find((p) => p.id === productId);
  const hasVariants = selectedProduct?.has_variants === true;

  const { data: variants = [] } = useProductVariantsQuery(productId, hasVariants);
  const activeVariants = (variants as ProductVariant[]).filter((v) => v.is_active);

  useEffect(() => {
    if (!hasVariants) {
      const currentValue = form.getValues(name);
      if (currentValue) {
        form.setValue(name, "" as never, { shouldDirty: true });
      }
    }
  }, [form, hasVariants, name]);

  if (!hasVariants) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>{t("inventory.form.product_variant")}</Label>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Select disabled={disabled} onValueChange={field.onChange} value={field.value as string}>
            <SelectTrigger>
              <SelectValue placeholder={t("inventory.form.select_variant")} />
            </SelectTrigger>
            <SelectContent>
              {activeVariants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.variant_name ?? variant.sku}
                  {variant.variant_name ? ` (${variant.sku})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FormFieldError message={(form.formState.errors as Record<string, { message?: string }>)[name]?.message} />
    </div>
  );
}
