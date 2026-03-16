"use client";

import { useMemo } from "react";
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

import type { CreateTaxProfileInput } from "../types";
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

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tax-profile-code">{t("inventory.common.code")}</Label>
          <Input id="tax-profile-code" placeholder="TF-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-profile-name">{t("inventory.common.name")}</Label>
          <Input id="tax-profile-name" placeholder="IVA General Bienes" {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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

        <div className="space-y-2">
          <Label htmlFor="tax-profile-cabys">{t("inventory.form.cabys_code")}</Label>
          <Input id="tax-profile-cabys" placeholder="1234567890123" {...form.register("cabys_code")} />
          <FormFieldError message={errors.cabys_code?.message} />
        </div>
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

      {taxType === "iva" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tax-profile-iva-rate-code">{t("inventory.form.iva_rate_code")}</Label>
            <Input
              id="tax-profile-iva-rate-code"
              placeholder="08"
              {...form.register("iva_rate_code")}
            />
            <FormFieldError message={errors.iva_rate_code?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-profile-iva-rate">{t("inventory.form.iva_rate")}</Label>
            <Input
              id="tax-profile-iva-rate"
              max={100}
              min={0}
              step="0.0001"
              type="number"
              {...form.register("iva_rate", {
                setValueAs: (value) => (value === "" ? undefined : Number(value)),
              })}
            />
            <FormFieldError message={errors.iva_rate?.message} />
          </div>
        </div>
      ) : null}

      {taxType === "specific_tax" ? (
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
