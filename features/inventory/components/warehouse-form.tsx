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
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { Branch } from "@/features/branches/types";

import type { CreateWarehouseInput } from "../types";
import { FormFieldError } from "./form-field-error";

type WarehouseFormProps = {
  branches: Branch[];
  form: UseFormReturn<CreateWarehouseInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateWarehouseInput) => Promise<void> | void;
  submitLabel: string;
};

function WarehouseForm({
  branches,
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: WarehouseFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");
  const isDefault = form.watch("is_default");
  const usesLocations = form.watch("uses_locations");

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warehouse-code">{t("inventory.common.code")}</Label>
          <Input id="warehouse-code" placeholder="WH-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouse-branch">{t("inventory.form.branch")}</Label>
          <Controller
            control={form.control}
            name="branch_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="warehouse-branch">
                  <SelectValue placeholder={t("inventory.form.select_branch")} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.branch_id?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warehouse-name">{t("inventory.common.name")}</Label>
          <Input id="warehouse-name" placeholder="Bodega Principal" {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouse-description">{t("inventory.common.description")}</Label>
          <Input
            id="warehouse-description"
            placeholder={t("inventory.common.description")}
            {...form.register("description")}
          />
          <FormFieldError message={errors.description?.message} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(usesLocations)}
            onCheckedChange={(checked) => {
              form.setValue("uses_locations", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.uses_locations")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.uses_locations_description")}
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(isDefault)}
            onCheckedChange={(checked) => {
              form.setValue("is_default", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.default_warehouse")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.default_warehouse_description")}
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
            <p className="font-medium">{t("inventory.form.active_warehouse")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.active_warehouse_description")}
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

export { WarehouseForm };
export type { WarehouseFormProps };
