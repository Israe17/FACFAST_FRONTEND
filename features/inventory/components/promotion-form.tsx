"use client";

import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

import type { CreatePromotionInput, Product } from "../types";
import { FormFieldError } from "./form-field-error";
import { VariantPicker } from "./variant-picker";

type PromotionFormProps = {
  form: UseFormReturn<CreatePromotionInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreatePromotionInput) => Promise<void> | void;
  products: Product[];
  submitLabel: string;
};

function PromotionForm({
  form,
  formError,
  isPending,
  onSubmit,
  products,
  submitLabel,
}: PromotionFormProps) {
  const { t } = useAppTranslator();
  const {
    control,
    formState: { errors },
    watch,
  } = form;
  const isActive = watch("is_active");
  const promotionType = watch("type");
  const activeProducts = useMemo(
    () => products.filter((product) => product.is_active && product.type === "product"),
    [products],
  );
  const { append, fields, remove } = useFieldArray({
    control,
    name: "items",
  });
  const promotionTypeOptions = useMemo(
    () => [
      { label: t("inventory.enum.promotion_type.percentage"), value: "percentage" },
      { label: t("inventory.enum.promotion_type.fixed_amount"), value: "fixed_amount" },
      { label: t("inventory.enum.promotion_type.buy_x_get_y"), value: "buy_x_get_y" },
      { label: t("inventory.enum.promotion_type.price_override"), value: "price_override" },
    ],
    [t],
  );

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="promotion-code">{t("inventory.common.code")}</Label>
          <Input id="promotion-code" placeholder="PN-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promotion-name">{t("inventory.common.name")}</Label>
          <Input id="promotion-name" placeholder="Promo 3x2" {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="promotion-type">{t("inventory.form.promotion_type")}</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="promotion-type">
                  <SelectValue placeholder={t("inventory.form.select_promotion_type")} />
                </SelectTrigger>
                <SelectContent>
                  {promotionTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.type?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promotion-valid-from">{t("inventory.form.valid_from")}</Label>
          <Input id="promotion-valid-from" type="datetime-local" {...form.register("valid_from")} />
          <FormFieldError message={errors.valid_from?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promotion-valid-to">{t("inventory.form.valid_to")}</Label>
          <Input id="promotion-valid-to" type="datetime-local" {...form.register("valid_to")} />
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
          <p className="font-medium">{t("inventory.form.active_promotion")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_promotion_description")}
          </p>
        </div>
      </label>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-semibold">{t("inventory.promotions.items_title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("inventory.promotions.items_description")}
            </p>
          </div>
          <Button
            onClick={() =>
              append({
                bonus_quantity: undefined,
                discount_value: undefined,
                min_quantity: undefined,
                override_price: undefined,
                product_id: "",
                product_variant_id: "",
              })
            }
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="size-4" />
            {t("inventory.promotions.add_item")}
          </Button>
        </div>

        {fields.length ? null : (
          <div className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            {t("inventory.promotions.no_items")}
          </div>
        )}

        {fields.map((field, index) => {
          const selectedProductId = watch(`items.${index}.product_id`) ?? "";
          const productOptions = activeProducts.some((product) => product.id === selectedProductId)
            ? activeProducts
            : [
                ...activeProducts,
                ...products.filter(
                  (product) =>
                    product.id === selectedProductId &&
                    !activeProducts.some((activeProduct) => activeProduct.id === product.id),
                ),
              ];

          return (
            <div key={field.id} className="space-y-4 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">
                {t("inventory.promotions.item_label", { index: String(index + 1) })}
              </p>
              <Button onClick={() => remove(index)} size="icon" type="button" variant="ghost">
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`promotion-item-product-${index}`}>{t("inventory.form.product")}</Label>
              <Controller
                control={control}
                name={`items.${index}.product_id`}
                render={({ field: productField }) => (
                  <Select onValueChange={productField.onChange} value={productField.value}>
                    <SelectTrigger id={`promotion-item-product-${index}`}>
                      <SelectValue placeholder={t("inventory.form.select_product")} />
                    </SelectTrigger>
                    <SelectContent>
                      {productOptions.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormFieldError message={errors.items?.[index]?.product_id?.message} />
            </div>

            <VariantPicker
              form={form}
              name={`items.${index}.product_variant_id` as const}
              productId={selectedProductId}
              products={productOptions}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor={`promotion-item-min-quantity-${index}`}>
                  {t("inventory.form.min_quantity")}
                </Label>
                <Input
                  id={`promotion-item-min-quantity-${index}`}
                  min={0}
                  step="0.0001"
                  type="number"
                  {...form.register(`items.${index}.min_quantity`, {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
                <FormFieldError message={errors.items?.[index]?.min_quantity?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`promotion-item-discount-value-${index}`}>
                  {t("inventory.form.discount_value")}
                </Label>
                <Input
                  disabled={promotionType === "buy_x_get_y" || promotionType === "price_override"}
                  id={`promotion-item-discount-value-${index}`}
                  min={0}
                  step="0.0001"
                  type="number"
                  {...form.register(`items.${index}.discount_value`, {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
                <FormFieldError message={errors.items?.[index]?.discount_value?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`promotion-item-override-price-${index}`}>
                  {t("inventory.form.override_price")}
                </Label>
                <Input
                  disabled={promotionType !== "price_override"}
                  id={`promotion-item-override-price-${index}`}
                  min={0}
                  step="0.0001"
                  type="number"
                  {...form.register(`items.${index}.override_price`, {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
                <FormFieldError message={errors.items?.[index]?.override_price?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`promotion-item-bonus-quantity-${index}`}>
                  {t("inventory.form.bonus_quantity")}
                </Label>
                <Input
                  disabled={promotionType !== "buy_x_get_y"}
                  id={`promotion-item-bonus-quantity-${index}`}
                  min={0}
                  step="0.0001"
                  type="number"
                  {...form.register(`items.${index}.bonus_quantity`, {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
                <FormFieldError message={errors.items?.[index]?.bonus_quantity?.message} />
              </div>
            </div>
            </div>
          );
        })}
      </section>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { PromotionForm };
export type { PromotionFormProps };
