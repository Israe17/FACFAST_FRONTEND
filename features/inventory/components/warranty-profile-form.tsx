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

import type { CreateWarrantyProfileInput } from "../types";
import { FormFieldError } from "./form-field-error";

type WarrantyProfileFormProps = {
  form: UseFormReturn<CreateWarrantyProfileInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateWarrantyProfileInput) => Promise<void> | void;
  submitLabel: string;
};

function WarrantyProfileForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: WarrantyProfileFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");
  const warrantyDurationUnitOptions = useMemo(
    () => [
      { label: t("inventory.enum.warranty_duration_unit.days"), value: "days" },
      { label: t("inventory.enum.warranty_duration_unit.months"), value: "months" },
      { label: t("inventory.enum.warranty_duration_unit.years"), value: "years" },
    ],
    [t],
  );

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warranty-profile-code">{t("inventory.common.code")}</Label>
          <Input id="warranty-profile-code" placeholder="WP-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warranty-profile-name">{t("inventory.common.name")}</Label>
          <Input
            id="warranty-profile-name"
            placeholder={t("inventory.entity.warranty_profile")}
            {...form.register("name")}
          />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warranty-profile-duration-value">{t("inventory.form.duration_value")}</Label>
          <Input
            id="warranty-profile-duration-value"
            min={1}
            step="1"
            type="number"
            {...form.register("duration_value", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.duration_value?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warranty-profile-duration-unit">{t("inventory.form.duration_unit")}</Label>
          <Controller
            control={form.control}
            name="duration_unit"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="warranty-profile-duration-unit">
                  <SelectValue placeholder={t("inventory.form.select_duration_unit")} />
                </SelectTrigger>
                <SelectContent>
                  {warrantyDurationUnitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.duration_unit?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="warranty-profile-coverage-notes">{t("inventory.form.coverage_notes")}</Label>
        <Textarea
          id="warranty-profile-coverage-notes"
          placeholder={t("inventory.form.coverage_notes")}
          {...form.register("coverage_notes")}
        />
        <FormFieldError message={errors.coverage_notes?.message} />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("inventory.form.active_warranty_profile")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_warranty_profile_description")}
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

export { WarrantyProfileForm };
export type { WarrantyProfileFormProps };
