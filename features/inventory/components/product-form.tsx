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
  Brand,
  CreateProductInput,
  MeasurementUnit,
  ProductCategory,
  TaxProfile,
  WarrantyProfile,
} from "../types";
import { FormFieldError } from "./form-field-error";

export const EMPTY_SELECT_VALUE = "__none__";

export type ProductFormProps = {
  brands: Brand[];
  categories: ProductCategory[];
  form: UseFormReturn<CreateProductInput>;
  formError?: string | null;
  isPending?: boolean;
  measurementUnits: MeasurementUnit[];
  onSubmit: (values: CreateProductInput) => Promise<void> | void;
  submitLabel: string;
  taxProfiles: TaxProfile[];
  warrantyProfiles: WarrantyProfile[];
};

export function ProductForm({
  brands,
  categories,
  form,
  formError,
  isPending,
  measurementUnits,
  onSubmit,
  submitLabel,
  taxProfiles,
  warrantyProfiles,
}: ProductFormProps) {
  const {
    formState: { errors },
  } = form;
  const { t } = useAppTranslator();
  const productType = form.watch("type");
  const hasWarranty = form.watch("has_warranty");
  const isActive = form.watch("is_active");
  const trackInventory = form.watch("track_inventory");
  const trackLots = form.watch("track_lots");
  const allowNegativeStock = form.watch("allow_negative_stock");
  const trackExpiration = form.watch("track_expiration");
  const isProductType = productType === "product";

  useEffect(() => {
    if (productType === "service") {
      form.setValue("track_inventory", false, { shouldDirty: true });
      form.setValue("track_lots", false, { shouldDirty: true });
      form.setValue("track_expiration", false, { shouldDirty: true });
      form.setValue("allow_negative_stock", false, { shouldDirty: true });
    }
  }, [form, productType]);

  useEffect(() => {
    if (!trackInventory) {
      form.setValue("track_lots", false, { shouldDirty: true });
      form.setValue("track_expiration", false, { shouldDirty: true });
    }
  }, [form, trackInventory]);

  useEffect(() => {
    if (!trackLots) {
      form.setValue("track_expiration", false, { shouldDirty: true });
    }
  }, [form, trackLots]);

  useEffect(() => {
    if (!hasWarranty) {
      form.setValue("warranty_profile_id", "", { shouldDirty: true });
    }
  }, [form, hasWarranty]);

  const compatibleTaxProfiles = taxProfiles.filter((taxProfile) => {
    if (!taxProfile.item_kind) {
      return true;
    }

    return productType === "product"
      ? taxProfile.item_kind === "goods"
      : taxProfile.item_kind === "service";
  });

  const productTypeOptions = useMemo(
    () => [
      { label: t("inventory.enum.product_type.product"), value: "product" },
      { label: t("inventory.enum.product_type.service"), value: "service" },
    ],
    [t],
  );

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">{t("inventory.products.general_information_title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("inventory.products.general_information_description")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-code">{t("inventory.common.code")}</Label>
            <Input id="product-code" placeholder="PD-0001" {...form.register("code")} />
            <FormFieldError message={errors.code?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-type">{t("inventory.form.type")}</Label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="product-type">
                    <SelectValue placeholder={t("inventory.form.select_type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypeOptions.map((option) => (
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-name">{t("inventory.common.name")}</Label>
            <Input id="product-name" placeholder={t("inventory.entity.product")} {...form.register("name")} />
            <FormFieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-sku">SKU</Label>
            <Input id="product-sku" placeholder="SKU-LL-185" {...form.register("sku")} />
            <FormFieldError message={errors.sku?.message} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-barcode">{t("inventory.form.barcode")}</Label>
            <Input id="product-barcode" placeholder="7501234567890" {...form.register("barcode")} />
            <FormFieldError message={errors.barcode?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">{t("inventory.common.description")}</Label>
            <Textarea
              id="product-description"
              placeholder={t("inventory.common.description")}
              {...form.register("description")}
            />
            <FormFieldError message={errors.description?.message} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">{t("inventory.products.relations_title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("inventory.products.relations_description")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="product-category">{t("inventory.entity.category")}</Label>
            <Controller
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                  value={field.value || EMPTY_SELECT_VALUE}
                >
                  <SelectTrigger id="product-category">
                    <SelectValue placeholder={t("inventory.form.no_category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SELECT_VALUE}>
                      {t("inventory.form.no_category")}
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.category_id?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-brand">{t("inventory.entity.brand")}</Label>
            <Controller
              control={form.control}
              name="brand_id"
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                  value={field.value || EMPTY_SELECT_VALUE}
                >
                  <SelectTrigger id="product-brand">
                    <SelectValue placeholder={t("inventory.form.no_brand")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SELECT_VALUE}>
                      {t("inventory.form.no_brand")}
                    </SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.brand_id?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-tax-profile">{t("inventory.form.tax_profile")}</Label>
            <Controller
              control={form.control}
              name="tax_profile_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="product-tax-profile">
                    <SelectValue placeholder={t("inventory.form.select_tax_profile")} />
                  </SelectTrigger>
                  <SelectContent>
                    {compatibleTaxProfiles.map((taxProfile) => (
                      <SelectItem key={taxProfile.id} value={taxProfile.id}>
                        {taxProfile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.tax_profile_id?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-stock-unit">{t("inventory.form.stock_unit")}</Label>
            <Controller
              control={form.control}
              name="stock_unit_id"
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                  value={field.value || EMPTY_SELECT_VALUE}
                >
                  <SelectTrigger id="product-stock-unit">
                    <SelectValue placeholder={t("inventory.form.no_stock_unit")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SELECT_VALUE}>
                      {t("inventory.form.no_stock_unit")}
                    </SelectItem>
                    {measurementUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.stock_unit_id?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-sale-unit">{t("inventory.form.sale_unit")}</Label>
            <Controller
              control={form.control}
              name="sale_unit_id"
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                  value={field.value || EMPTY_SELECT_VALUE}
                >
                  <SelectTrigger id="product-sale-unit">
                    <SelectValue placeholder={t("inventory.form.no_sale_unit")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SELECT_VALUE}>
                      {t("inventory.form.no_sale_unit")}
                    </SelectItem>
                    {measurementUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.sale_unit_id?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-warranty-profile">{t("inventory.form.warranty_profile")}</Label>
            <Controller
              control={form.control}
              name="warranty_profile_id"
              render={({ field }) => (
                <Select
                  disabled={!hasWarranty}
                  onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                  value={field.value || EMPTY_SELECT_VALUE}
                >
                  <SelectTrigger id="product-warranty-profile">
                    <SelectValue placeholder={t("inventory.form.no_warranty_profile")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SELECT_VALUE}>
                      {t("inventory.form.no_warranty_profile")}
                    </SelectItem>
                    {warrantyProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.warranty_profile_id?.message} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">{t("inventory.products.operational_behavior_title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("inventory.products.operational_behavior_description")}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
            <Checkbox
              checked={Boolean(trackInventory)}
              disabled={!isProductType}
              onCheckedChange={(checked) => {
                form.setValue("track_inventory", checked === true, { shouldDirty: true });
              }}
            />
            <div className="space-y-1">
              <p className="font-medium">{t("inventory.form.track_inventory")}</p>
              <p className="text-sm text-muted-foreground">{t("inventory.form.track_inventory_description")}</p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
            <Checkbox
              checked={Boolean(trackLots)}
              disabled={!isProductType || !trackInventory}
              onCheckedChange={(checked) => {
                form.setValue("track_lots", checked === true, { shouldDirty: true });
              }}
            />
            <div className="space-y-1">
              <p className="font-medium">{t("inventory.form.track_lots")}</p>
              <p className="text-sm text-muted-foreground">{t("inventory.form.track_lots_description")}</p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
            <Checkbox
              checked={Boolean(trackExpiration)}
              disabled={!isProductType || !trackLots}
              onCheckedChange={(checked) => {
                form.setValue("track_expiration", checked === true, { shouldDirty: true });
              }}
            />
            <div className="space-y-1">
              <p className="font-medium">{t("inventory.form.track_expiration")}</p>
              <p className="text-sm text-muted-foreground">{t("inventory.form.track_expiration_description")}</p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
            <Checkbox
              checked={Boolean(allowNegativeStock)}
              disabled={!isProductType}
              onCheckedChange={(checked) => {
                form.setValue("allow_negative_stock", checked === true, { shouldDirty: true });
              }}
            />
            <div className="space-y-1">
              <p className="font-medium">{t("inventory.form.allow_negative_stock")}</p>
              <p className="text-sm text-muted-foreground">{t("inventory.form.allow_negative_stock_description")}</p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
            <Checkbox
              checked={Boolean(hasWarranty)}
              onCheckedChange={(checked) => {
                form.setValue("has_warranty", checked === true, { shouldDirty: true });
              }}
            />
            <div className="space-y-1">
              <p className="font-medium">{t("inventory.form.has_warranty")}</p>
              <p className="text-sm text-muted-foreground">{t("inventory.form.has_warranty_description")}</p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
            <Checkbox
              checked={Boolean(isActive)}
              onCheckedChange={(checked) => {
                form.setValue("is_active", checked === true, { shouldDirty: true });
              }}
            />
            <div className="space-y-1">
              <p className="font-medium">{t("inventory.form.active_product")}</p>
              <p className="text-sm text-muted-foreground">{t("inventory.form.active_product_description")}</p>
            </div>
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}
