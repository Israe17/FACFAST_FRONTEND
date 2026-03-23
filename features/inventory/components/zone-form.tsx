"use client";

import type { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { CreateZoneInput } from "../types";
import { FormFieldError } from "./form-field-error";

type ZoneFormProps = {
  form: UseFormReturn<CreateZoneInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateZoneInput) => Promise<void> | void;
  submitLabel: string;
};

function ZoneForm({ form, formError, isPending, onSubmit, submitLabel }: ZoneFormProps) {
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
          <Label htmlFor="zone-code">{t("inventory.common.code")}</Label>
          <Input id="zone-code" placeholder="ZN-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone-name">{t("inventory.common.name")}</Label>
          <Input id="zone-name" placeholder="Zona Norte" {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zone-description">{t("inventory.common.description")}</Label>
        <Textarea
          id="zone-description"
          placeholder={t("inventory.common.description")}
          {...form.register("description")}
        />
        <FormFieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="zone-province">{t("inventory.zones.province")}</Label>
          <Input id="zone-province" placeholder="San José" {...form.register("province")} />
          <FormFieldError message={errors.province?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone-canton">{t("inventory.zones.canton")}</Label>
          <Input id="zone-canton" placeholder="Central" {...form.register("canton")} />
          <FormFieldError message={errors.canton?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone-district">{t("inventory.zones.district")}</Label>
          <Input id="zone-district" placeholder="Carmen" {...form.register("district")} />
          <FormFieldError message={errors.district?.message} />
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
          <p className="font-medium">{t("inventory.form.active_zone")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_zone_description")}
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

export { ZoneForm };
export type { ZoneFormProps };
