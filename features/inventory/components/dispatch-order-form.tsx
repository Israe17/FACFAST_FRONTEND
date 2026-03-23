"use client";

import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

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

import { dispatchTypeValues } from "../constants";
import type { CreateDispatchOrderInput } from "../types";
import { FormFieldError } from "./form-field-error";

type DispatchOrderFormProps = {
  form: UseFormReturn<CreateDispatchOrderInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateDispatchOrderInput) => Promise<void> | void;
  submitLabel: string;
};

function DispatchOrderForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: DispatchOrderFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dispatch-code">{t("inventory.common.code")}</Label>
          <Input id="dispatch-code" placeholder="DO-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatch-branch-id">{t("inventory.form.branch")}</Label>
          <Input
            id="dispatch-branch-id"
            placeholder="1"
            {...form.register("branch_id")}
          />
          <FormFieldError message={errors.branch_id?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("inventory.dispatch.dispatch_type")}</Label>
          <Controller
            control={form.control}
            name="dispatch_type"
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value)}
                value={field.value ?? "individual"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dispatchTypeValues.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(
                        type === "individual"
                          ? "inventory.dispatch.type_individual"
                          : "inventory.dispatch.type_consolidated",
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.dispatch_type?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatch-scheduled-date">
            {t("inventory.dispatch.scheduled_date")}
          </Label>
          <Input
            id="dispatch-scheduled-date"
            type="date"
            {...form.register("scheduled_date")}
          />
          <FormFieldError message={errors.scheduled_date?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dispatch-route-id">{t("inventory.dispatch.route")}</Label>
          <Input
            id="dispatch-route-id"
            placeholder="ID"
            {...form.register("route_id")}
          />
          <FormFieldError message={errors.route_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatch-vehicle-id">{t("inventory.dispatch.vehicle")}</Label>
          <Input
            id="dispatch-vehicle-id"
            placeholder="ID"
            {...form.register("vehicle_id")}
          />
          <FormFieldError message={errors.vehicle_id?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dispatch-driver-id">{t("inventory.dispatch.driver")}</Label>
          <Input
            id="dispatch-driver-id"
            placeholder="ID"
            {...form.register("driver_user_id")}
          />
          <FormFieldError message={errors.driver_user_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatch-warehouse-id">
            {t("inventory.dispatch.origin_warehouse")}
          </Label>
          <Input
            id="dispatch-warehouse-id"
            placeholder="ID"
            {...form.register("origin_warehouse_id")}
          />
          <FormFieldError message={errors.origin_warehouse_id?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dispatch-notes">{t("inventory.common.notes")}</Label>
        <Textarea
          id="dispatch-notes"
          placeholder={t("inventory.common.notes")}
          {...form.register("notes")}
        />
        <FormFieldError message={errors.notes?.message} />
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { DispatchOrderForm };
export type { DispatchOrderFormProps };
