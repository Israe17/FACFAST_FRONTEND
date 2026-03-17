"use client";

import type { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { CreateMeasurementUnitInput } from "../types";
import { FormFieldError } from "./form-field-error";

type MeasurementUnitFormProps = {
  form: UseFormReturn<CreateMeasurementUnitInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateMeasurementUnitInput) => Promise<void> | void;
  submitLabel: string;
};

function MeasurementUnitForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: MeasurementUnitFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="measurement-unit-code">{t("inventory.common.code")}</Label>
          <Input id="measurement-unit-code" placeholder="MU-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="measurement-unit-name">{t("inventory.common.name")}</Label>
          <Input
            id="measurement-unit-name"
            placeholder={t("inventory.entity.measurement_unit")}
            {...form.register("name")}
          />
          <FormFieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="measurement-unit-symbol">{t("inventory.common.symbol")}</Label>
          <Input id="measurement-unit-symbol" placeholder="kg" {...form.register("symbol")} />
          <FormFieldError message={errors.symbol?.message} />
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
          <p className="font-medium">{t("inventory.form.active_measurement_unit")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_measurement_unit_description")}
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

export { MeasurementUnitForm };
export type { MeasurementUnitFormProps };
