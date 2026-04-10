"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";

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

import type { CreateVehicleInput } from "../types";
import { FormFieldError } from "./form-field-error";

const VEHICLE_TYPE_OPTIONS = [
  { value: "truck", label: "inventory.vehicles.type_truck" },
  { value: "van", label: "inventory.vehicles.type_van" },
  { value: "pickup", label: "inventory.vehicles.type_pickup" },
  { value: "motorcycle", label: "inventory.vehicles.type_motorcycle" },
  { value: "bicycle", label: "inventory.vehicles.type_bicycle" },
  { value: "car", label: "inventory.vehicles.type_car" },
  { value: "other", label: "inventory.vehicles.type_other" },
] as const;

type VehicleFormProps = {
  form: UseFormReturn<CreateVehicleInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateVehicleInput) => Promise<void> | void;
  submitLabel: string;
};

function VehicleForm({ form, formError, isPending, onSubmit, submitLabel }: VehicleFormProps) {
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
          <Label htmlFor="vehicle-code">{t("inventory.common.code")}</Label>
          <Input id="vehicle-code" placeholder="VH-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle-name">{t("inventory.common.name")}</Label>
          <Input id="vehicle-name" placeholder={t("inventory.vehicles.name_placeholder")} {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vehicle-plate-number">{t("inventory.vehicles.plate_number")}</Label>
          <Input
            id="vehicle-plate-number"
            placeholder="ABC-123"
            {...form.register("plate_number")}
          />
          <FormFieldError message={errors.plate_number?.message} />
        </div>

        <div className="space-y-2">
          <Label>{t("inventory.vehicles.vehicle_type")}</Label>
          <Controller
            control={form.control}
            name="vehicle_type"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("inventory.vehicles.select_vehicle_type")} />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.label as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.vehicle_type?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vehicle-max-weight">{t("inventory.vehicles.max_weight_kg")}</Label>
          <Input
            id="vehicle-max-weight"
            min={0}
            step="0.01"
            type="number"
            placeholder="0"
            {...form.register("max_weight_kg")}
          />
          <FormFieldError message={errors.max_weight_kg?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle-max-volume">{t("inventory.vehicles.max_volume_m3")}</Label>
          <Input
            id="vehicle-max-volume"
            min={0}
            step="0.01"
            type="number"
            placeholder="0"
            {...form.register("max_volume_m3")}
          />
          <FormFieldError message={errors.max_volume_m3?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicle-notes">{t("inventory.vehicles.notes")}</Label>
        <Textarea
          id="vehicle-notes"
          placeholder={t("inventory.vehicles.notes_placeholder")}
          {...form.register("notes")}
        />
        <FormFieldError message={errors.notes?.message} />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("inventory.form.active_vehicle")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_vehicle_description")}
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

export { VehicleForm };
export type { VehicleFormProps };
