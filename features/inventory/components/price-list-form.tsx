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
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { CreatePriceListInput } from "../types";
import { FormFieldError } from "./form-field-error";

type PriceListFormProps = {
  form: UseFormReturn<CreatePriceListInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreatePriceListInput) => Promise<void> | void;
  submitLabel: string;
};

function PriceListForm({ form, formError, isPending, onSubmit, submitLabel }: PriceListFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isDefault = form.watch("is_default");
  const isActive = form.watch("is_active");
  const kindOptions = useMemo(
    () => [
      { label: t("inventory.enum.price_list_kind.retail"), value: "retail" },
      { label: t("inventory.enum.price_list_kind.wholesale"), value: "wholesale" },
      { label: t("inventory.enum.price_list_kind.credit"), value: "credit" },
      { label: t("inventory.enum.price_list_kind.special"), value: "special" },
    ],
    [t],
  );

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price-list-code">{t("inventory.common.code")}</Label>
          <Input id="price-list-code" placeholder="PL-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price-list-name">{t("inventory.common.name")}</Label>
          <Input id="price-list-name" placeholder={t("inventory.entity.price_list")} {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price-list-kind">{t("inventory.common.kind")}</Label>
          <Controller
            control={form.control}
            name="kind"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="price-list-kind">
                  <SelectValue placeholder={t("inventory.form.select_kind")} />
                </SelectTrigger>
                <SelectContent>
                  {kindOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.kind?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price-list-currency">{t("inventory.common.currency")}</Label>
          <Input id="price-list-currency" maxLength={3} placeholder="CRC" {...form.register("currency")} />
          <FormFieldError message={errors.currency?.message} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(isDefault)}
            onCheckedChange={(checked) => {
              form.setValue("is_default", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.default_price_list")}</p>
            <p className="text-sm text-muted-foreground">{t("inventory.form.default_price_list_description")}</p>
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
            <p className="font-medium">{t("inventory.form.active_price_list")}</p>
            <p className="text-sm text-muted-foreground">{t("inventory.form.active_price_list_description")}</p>
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

export { PriceListForm };
export type { PriceListFormProps };
