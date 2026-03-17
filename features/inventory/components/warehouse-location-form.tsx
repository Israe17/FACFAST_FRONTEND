"use client";

import type { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { CreateWarehouseLocationInput } from "../types";
import { FormFieldError } from "./form-field-error";

type WarehouseLocationFormProps = {
  form: UseFormReturn<CreateWarehouseLocationInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateWarehouseLocationInput) => Promise<void> | void;
  submitLabel: string;
};

function WarehouseLocationForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: WarehouseLocationFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-code">{t("inventory.common.code")}</Label>
          <Input id="warehouse-location-code" placeholder="WL-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouse-location-name">{t("inventory.common.name")}</Label>
          <Input
            id="warehouse-location-name"
            placeholder="Pasillo A - Rack 1"
            {...form.register("name")}
          />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-zone">{t("inventory.form.zone")}</Label>
          <Input id="warehouse-location-zone" {...form.register("zone")} />
          <FormFieldError message={errors.zone?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-aisle">{t("inventory.form.aisle")}</Label>
          <Input id="warehouse-location-aisle" {...form.register("aisle")} />
          <FormFieldError message={errors.aisle?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-rack">{t("inventory.form.rack")}</Label>
          <Input id="warehouse-location-rack" {...form.register("rack")} />
          <FormFieldError message={errors.rack?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-level">{t("inventory.form.level")}</Label>
          <Input id="warehouse-location-level" {...form.register("level")} />
          <FormFieldError message={errors.level?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-position">{t("inventory.form.position")}</Label>
          <Input id="warehouse-location-position" {...form.register("position")} />
          <FormFieldError message={errors.position?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-barcode">{t("inventory.form.barcode")}</Label>
          <Input id="warehouse-location-barcode" {...form.register("barcode")} />
          <FormFieldError message={errors.barcode?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="warehouse-location-description">{t("inventory.common.description")}</Label>
        <Input id="warehouse-location-description" {...form.register("description")} />
        <FormFieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["is_picking_area", "inventory.form.is_picking_area", "inventory.form.is_picking_area_description"],
            ["is_receiving_area", "inventory.form.is_receiving_area", "inventory.form.is_receiving_area_description"],
            ["is_dispatch_area", "inventory.form.is_dispatch_area", "inventory.form.is_dispatch_area_description"],
            ["is_active", "inventory.form.active_warehouse_location", "inventory.form.active_warehouse_location_description"],
          ] as const
        ).map(([fieldName, labelKey, descriptionKey]) => (
          <label key={fieldName} className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
            <Checkbox
              checked={Boolean(form.watch(fieldName))}
              onCheckedChange={(checked) => {
                form.setValue(fieldName, checked === true, { shouldDirty: true });
              }}
            />
            <div className="space-y-1">
              <p className="font-medium">{t(labelKey)}</p>
              <p className="text-sm text-muted-foreground">{t(descriptionKey)}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { WarehouseLocationForm };
export type { WarehouseLocationFormProps };
