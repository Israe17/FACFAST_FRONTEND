"use client";

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

import type { CreateRouteInput } from "../types";
import { FormFieldError } from "./form-field-error";

const EMPTY_SELECT_VALUE = "__none__";

type RouteFormProps = {
  form: UseFormReturn<CreateRouteInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateRouteInput) => Promise<void> | void;
  submitLabel: string;
  vehicles: Array<{ id: string; name: string; plate_number: string }>;
  zones: Array<{ id: string; name: string }>;
};

function RouteForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
  vehicles,
  zones,
}: RouteFormProps) {
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
          <Label htmlFor="route-code">{t("inventory.common.code")}</Label>
          <Input id="route-code" placeholder="RT-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="route-name">{t("inventory.common.name")}</Label>
          <Input id="route-name" placeholder="Ruta Centro" {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="route-description">{t("inventory.common.description")}</Label>
        <Textarea
          id="route-description"
          placeholder={t("inventory.common.description")}
          {...form.register("description")}
        />
        <FormFieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("inventory.routes.zone")}</Label>
          <Controller
            control={form.control}
            name="zone_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === EMPTY_SELECT_VALUE ? undefined : Number(value))
                }
                value={field.value != null ? String(field.value) : EMPTY_SELECT_VALUE}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("inventory.routes.select_zone")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    {t("inventory.routes.no_zone")}
                  </SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.zone_id?.message} />
        </div>

        <div className="space-y-2">
          <Label>{t("inventory.routes.default_vehicle")}</Label>
          <Controller
            control={form.control}
            name="default_vehicle_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === EMPTY_SELECT_VALUE ? undefined : Number(value))
                }
                value={field.value != null ? String(field.value) : EMPTY_SELECT_VALUE}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("inventory.routes.select_vehicle")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    {t("inventory.routes.no_vehicle")}
                  </SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.plate_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.default_vehicle_id?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="route-driver">{t("inventory.routes.default_driver_user_id")}</Label>
          <Input
            id="route-driver"
            min={1}
            type="number"
            {...form.register("default_driver_user_id")}
          />
          <FormFieldError message={errors.default_driver_user_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="route-estimated-cost">{t("inventory.routes.estimated_cost")}</Label>
          <Input
            id="route-estimated-cost"
            min={0}
            step="0.01"
            type="number"
            {...form.register("estimated_cost")}
          />
          <FormFieldError message={errors.estimated_cost?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="route-frequency">{t("inventory.routes.frequency")}</Label>
          <Input id="route-frequency" placeholder="Semanal" {...form.register("frequency")} />
          <FormFieldError message={errors.frequency?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="route-day-of-week">{t("inventory.routes.day_of_week")}</Label>
        <Input id="route-day-of-week" placeholder="Lunes" {...form.register("day_of_week")} />
        <FormFieldError message={errors.day_of_week?.message} />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("inventory.form.active_route")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_route_description")}
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

export { RouteForm };
export type { RouteFormProps };
