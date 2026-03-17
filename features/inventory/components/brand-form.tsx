"use client";

import type { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { CreateBrandInput } from "../types";
import { FormFieldError } from "./form-field-error";

type BrandFormProps = {
  form: UseFormReturn<CreateBrandInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateBrandInput) => Promise<void> | void;
  submitLabel: string;
};

function BrandForm({ form, formError, isPending, onSubmit, submitLabel }: BrandFormProps) {
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
          <Label htmlFor="brand-code">{t("inventory.common.code")}</Label>
          <Input id="brand-code" placeholder="MK-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-name">{t("inventory.common.name")}</Label>
          <Input id="brand-name" placeholder="Michelin" {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand-description">{t("inventory.common.description")}</Label>
        <Textarea
          id="brand-description"
          placeholder={t("inventory.common.description")}
          {...form.register("description")}
        />
        <FormFieldError message={errors.description?.message} />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("inventory.form.active_brand")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_brand_description")}
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

export { BrandForm };
export type { BrandFormProps };
