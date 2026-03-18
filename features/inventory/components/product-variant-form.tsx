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

import type {
  CreateProductVariantInput,
  MeasurementUnit,
  TaxProfile,
  WarrantyProfile,
} from "../types";
import { FormFieldError } from "./form-field-error";

const EMPTY_SELECT_VALUE = "__none__";

type ProductVariantFormProps = {
  form: UseFormReturn<CreateProductVariantInput>;
  formError?: string | null;
  isPending?: boolean;
  measurementUnits: MeasurementUnit[];
  onSubmit: (values: CreateProductVariantInput) => Promise<void> | void;
  submitLabel: string;
  taxProfiles: TaxProfile[];
  warrantyProfiles: WarrantyProfile[];
};

function ProductVariantForm({
  form,
  formError,
  isPending,
  measurementUnits,
  onSubmit,
  submitLabel,
  taxProfiles,
  warrantyProfiles,
}: ProductVariantFormProps) {
  const {
    formState: { errors },
  } = form;
  const { t } = useAppTranslator();
  const trackInventory = form.watch("track_inventory");
  const trackLots = form.watch("track_lots");

  useEffect(() => {
    if (!trackInventory) {
      form.setValue("track_lots", false, { shouldDirty: true });
      form.setValue("track_expiration", false, { shouldDirty: true });
      form.setValue("track_serials", false, { shouldDirty: true });
    }
  }, [form, trackInventory]);

  useEffect(() => {
    if (!trackLots) {
      form.setValue("track_expiration", false, { shouldDirty: true });
    }
  }, [form, trackLots]);

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="variant-name">{t("inventory.form.variant_name")}</Label>
          <Input
            id="variant-name"
            placeholder={t("inventory.form.variant_name_placeholder")}
            {...form.register("variant_name")}
          />
          <FormFieldError message={errors.variant_name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variant-sku">SKU</Label>
          <Input id="variant-sku" placeholder="SKU-PROD-VAR" {...form.register("sku")} />
          <FormFieldError message={errors.sku?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="variant-barcode">{t("inventory.form.barcode")}</Label>
          <Input id="variant-barcode" placeholder="7501234567890" {...form.register("barcode")} />
          <FormFieldError message={errors.barcode?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variant-tax-profile">{t("inventory.form.tax_profile")}</Label>
          <Controller
            control={form.control}
            name="fiscal_profile_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="variant-tax-profile">
                  <SelectValue placeholder={t("inventory.form.select_tax_profile")} />
                </SelectTrigger>
                <SelectContent>
                  {taxProfiles.map((tp) => (
                    <SelectItem key={tp.id} value={tp.id}>
                      {tp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.fiscal_profile_id?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="variant-stock-unit">{t("inventory.form.stock_unit")}</Label>
          <Controller
            control={form.control}
            name="stock_unit_measure_id"
            render={({ field }) => (
              <Select
                onValueChange={(v) => field.onChange(v === EMPTY_SELECT_VALUE ? "" : v)}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="variant-stock-unit">
                  <SelectValue placeholder={t("inventory.form.no_stock_unit")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    {t("inventory.form.no_stock_unit")}
                  </SelectItem>
                  {measurementUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.stock_unit_measure_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variant-sale-unit">{t("inventory.form.sale_unit")}</Label>
          <Controller
            control={form.control}
            name="sale_unit_measure_id"
            render={({ field }) => (
              <Select
                onValueChange={(v) => field.onChange(v === EMPTY_SELECT_VALUE ? "" : v)}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="variant-sale-unit">
                  <SelectValue placeholder={t("inventory.form.no_sale_unit")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    {t("inventory.form.no_sale_unit")}
                  </SelectItem>
                  {measurementUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.sale_unit_measure_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variant-warranty-profile">{t("inventory.form.warranty_profile")}</Label>
          <Controller
            control={form.control}
            name="default_warranty_profile_id"
            render={({ field }) => (
              <Select
                onValueChange={(v) => field.onChange(v === EMPTY_SELECT_VALUE ? "" : v)}
                value={field.value || EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="variant-warranty-profile">
                  <SelectValue placeholder={t("inventory.form.no_warranty_profile")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    {t("inventory.form.no_warranty_profile")}
                  </SelectItem>
                  {warrantyProfiles.map((wp) => (
                    <SelectItem key={wp.id} value={wp.id}>
                      {wp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.default_warranty_profile_id?.message} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(trackInventory)}
            onCheckedChange={(checked) => {
              form.setValue("track_inventory", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.track_inventory")}</p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(trackLots)}
            disabled={!trackInventory}
            onCheckedChange={(checked) => {
              form.setValue("track_lots", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.track_lots")}</p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(form.watch("track_expiration"))}
            disabled={!trackLots}
            onCheckedChange={(checked) => {
              form.setValue("track_expiration", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.track_expiration")}</p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(form.watch("track_serials"))}
            disabled={!trackInventory}
            onCheckedChange={(checked) => {
              form.setValue("track_serials", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.track_serials")}</p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(form.watch("allow_negative_stock"))}
            onCheckedChange={(checked) => {
              form.setValue("allow_negative_stock", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.allow_negative_stock")}</p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(form.watch("is_active"))}
            onCheckedChange={(checked) => {
              form.setValue("is_active", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.common.active")}</p>
          </div>
        </label>
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { ProductVariantForm };
