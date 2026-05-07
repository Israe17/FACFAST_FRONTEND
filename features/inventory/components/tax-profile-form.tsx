"use client";

import { useCallback, useMemo } from "react";
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

import { resolveHaciendaIvaRateCode } from "../constants";
import type { CabysSearchResult, CreateTaxProfileInput } from "../types";
import { CabysSearchInput } from "./cabys-search-input";
import { FormFieldError } from "./form-field-error";

type TaxProfileFormProps = {
  form: UseFormReturn<CreateTaxProfileInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateTaxProfileInput) => Promise<void> | void;
  submitLabel: string;
};

function TaxProfileForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: TaxProfileFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");
  const taxType = form.watch("tax_type");
  const requiresCabys = form.watch("requires_cabys");
  const allowsExoneration = form.watch("allows_exoneration");
  const cabysCode = form.watch("cabys_code");
  const ivaRate = form.watch("iva_rate");
  const ivaRateCode = form.watch("iva_rate_code");
  const currentCabys = useMemo(
    () => (cabysCode ? { codigo: cabysCode, descripcion: "", impuesto: ivaRate ?? 0 } : null),
    [cabysCode, ivaRate],
  );
  const taxProfileItemKindOptions = useMemo(
    () => [
      { label: t("inventory.enum.tax_profile_item_kind.goods"), value: "goods" },
      { label: t("inventory.enum.tax_profile_item_kind.service"), value: "service" },
    ],
    [t],
  );
  const taxTypeOptions = useMemo(
    () => [
      { label: t("inventory.enum.tax_type.iva"), value: "iva" },
      { label: t("inventory.enum.tax_type.exento"), value: "exento" },
      { label: t("inventory.enum.tax_type.no_sujeto"), value: "no_sujeto" },
      { label: t("inventory.enum.tax_type.specific_tax"), value: "specific_tax" },
    ],
    [t],
  );

  const handleCabysChange = useCallback(
    (result: CabysSearchResult | null) => {
      if (!result) {
        form.setValue("cabys_code", "", { shouldDirty: true });
        return;
      }
      form.setValue("cabys_code", result.codigo, { shouldDirty: true });
      const rate = result.impuesto;
      const nextTaxType = rate === 0 ? "exento" : "iva";
      form.setValue("tax_type", nextTaxType, { shouldDirty: true });
      if (nextTaxType === "iva") {
        form.setValue("iva_rate", rate, { shouldDirty: true });
        form.setValue("iva_rate_code", resolveHaciendaIvaRateCode(rate), {
          shouldDirty: true,
        });
      } else {
        form.setValue("iva_rate", undefined, { shouldDirty: true });
        form.setValue("iva_rate_code", "", { shouldDirty: true });
      }
      if (result.descripcion) {
        if (!form.getValues("description")?.trim()) {
          form.setValue("description", result.descripcion, { shouldDirty: true });
        }
        if (!form.getValues("name")?.trim()) {
          const baseLabel = result.descripcion.substring(0, 80);
          const suggestedName =
            nextTaxType === "iva"
              ? `IVA ${rate}% - ${baseLabel}`
              : baseLabel;
          form.setValue("name", suggestedName, { shouldDirty: true });
        }
      }
    },
    [form],
  );

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">{t("inventory.form.cabys_section_title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.tax_profile_cabys_section_description")}
          </p>
        </div>

        <div className="space-y-2">
          <Label>{t("inventory.form.cabys_code")}</Label>
          <CabysSearchInput onChange={handleCabysChange} value={currentCabys} />
          <FormFieldError message={errors.cabys_code?.message} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="tax-profile-tax-type">{t("inventory.form.tax_type")}</Label>
            <Controller
              control={form.control}
              name="tax_type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="tax-profile-tax-type">
                    <SelectValue placeholder={t("inventory.form.select_tax_type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {taxTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.tax_type?.message} />
          </div>

          {taxType === "iva" ? (
            <div className="space-y-2">
              <Label htmlFor="tax-profile-iva-rate">{t("inventory.form.iva_rate")}</Label>
              <Input
                id="tax-profile-iva-rate"
                max={100}
                min={0}
                placeholder="13"
                step="0.0001"
                type="number"
                {...form.register("iva_rate", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                  onChange: (e) => {
                    const next = Number(e.target.value);
                    if (!Number.isNaN(next)) {
                      form.setValue(
                        "iva_rate_code",
                        resolveHaciendaIvaRateCode(next),
                        { shouldDirty: true },
                      );
                    }
                  },
                })}
              />
              <p className="text-xs text-muted-foreground">
                {t("inventory.form.iva_rate_code_hint", {
                  code: ivaRateCode || resolveHaciendaIvaRateCode(ivaRate ?? 13),
                })}
              </p>
              <FormFieldError message={errors.iva_rate?.message} />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="tax-profile-item-kind">{t("inventory.form.item_kind")}</Label>
            <Controller
              control={form.control}
              name="item_kind"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="tax-profile-item-kind">
                    <SelectValue placeholder={t("inventory.form.select_item_kind")} />
                  </SelectTrigger>
                  <SelectContent>
                    {taxProfileItemKindOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.item_kind?.message} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">{t("inventory.form.tax_profile_identity_section_title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.tax_profile_identity_section_description")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-profile-name">{t("inventory.common.name")}</Label>
          <Input
            id="tax-profile-name"
            placeholder={t("inventory.form.tax_profile_name_placeholder")}
            {...form.register("name")}
          />
          <FormFieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-profile-description">{t("inventory.common.description")}</Label>
          <Textarea
            id="tax-profile-description"
            placeholder={t("inventory.common.description")}
            {...form.register("description")}
          />
          <FormFieldError message={errors.description?.message} />
        </div>
      </section>

      {taxType === "specific_tax" ? (
        <section className="space-y-4 rounded-xl border border-border/70 p-4">
          <div className="space-y-1">
            <h3 className="font-semibold">{t("inventory.form.specific_tax_name")}</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tax-profile-specific-tax-name">
                {t("inventory.form.specific_tax_name")}
              </Label>
              <Input
                id="tax-profile-specific-tax-name"
                placeholder={t("inventory.form.specific_tax_name")}
                {...form.register("specific_tax_name")}
              />
              <FormFieldError message={errors.specific_tax_name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-profile-specific-tax-rate">
                {t("inventory.form.specific_tax_rate")}
              </Label>
              <Input
                id="tax-profile-specific-tax-rate"
                min={0}
                step="0.0001"
                type="number"
                {...form.register("specific_tax_rate", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
              <FormFieldError message={errors.specific_tax_rate?.message} />
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(requiresCabys)}
            onCheckedChange={(checked) => {
              form.setValue("requires_cabys", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.requires_cabys")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.requires_cabys_description")}
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(allowsExoneration)}
            onCheckedChange={(checked) => {
              form.setValue("allows_exoneration", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.allows_exoneration")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.allows_exoneration_description")}
            </p>
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
            <p className="font-medium">{t("inventory.form.active_tax_profile")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.active_tax_profile_description")}
            </p>
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

export { TaxProfileForm };
export type { TaxProfileFormProps };
