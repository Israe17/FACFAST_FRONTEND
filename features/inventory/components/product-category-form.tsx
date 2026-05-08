"use client";

import { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
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

import { deriveItemKindFromCabys, taxProfileItemKindTranslationMap } from "../constants";
import type { CreateProductCategoryInput, ProductCategory } from "../types";
import { CabysSearchInput } from "./cabys-search-input";
import { FormFieldError } from "./form-field-error";

const EMPTY_PARENT_VALUE = "__none__";

type ProductCategoryFormProps = {
  categories: ProductCategory[];
  currentCategoryId?: string;
  form: UseFormReturn<CreateProductCategoryInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateProductCategoryInput) => Promise<void> | void;
  submitLabel: string;
};

function ProductCategoryForm({
  categories,
  currentCategoryId,
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: ProductCategoryFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");
  const itemKind = form.watch("item_kind") ?? "goods";
  const cabysCode = form.watch("cabys_code");
  const cabysDescripcion = form.watch("cabys_descripcion");
  const cabysImpuesto = form.watch("cabys_impuesto");
  const currentCabys = useMemo(() => {
    if (cabysCode && cabysDescripcion != null) {
      return { codigo: cabysCode, descripcion: cabysDescripcion, impuesto: cabysImpuesto ?? 0 };
    }
    return null;
  }, [cabysCode, cabysDescripcion, cabysImpuesto]);

  // Keep item_kind in sync with whatever CABYS is currently selected.
  // Auto-derives on mount (loading existing category) and on every CABYS change.
  useEffect(() => {
    const derived = deriveItemKindFromCabys(cabysCode);
    if (derived !== form.getValues("item_kind")) {
      form.setValue("item_kind", derived, { shouldDirty: true });
    }
  }, [cabysCode, form]);

  const availableParents = categories.filter((category) => category.id !== currentCategoryId);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="space-y-2">
        <Label htmlFor="category-name">{t("inventory.common.name")}</Label>
        <Input
          id="category-name"
          placeholder={t("inventory.entity.product_category")}
          {...form.register("name")}
        />
        <FormFieldError message={errors.name?.message} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category-parent">{t("inventory.form.parent_category")}</Label>
          <Controller
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value === EMPTY_PARENT_VALUE ? "" : value)}
                value={field.value || EMPTY_PARENT_VALUE}
              >
                <SelectTrigger id="category-parent">
                  <SelectValue placeholder={t("inventory.form.no_parent")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_PARENT_VALUE}>
                    {t("inventory.form.no_parent")}
                  </SelectItem>
                  {availableParents.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.parent_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-description">{t("inventory.common.description")}</Label>
          <Textarea
            id="category-description"
            placeholder={t("inventory.common.description")}
            {...form.register("description")}
          />
          <FormFieldError message={errors.description?.message} />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label>{t("inventory.form.cabys_section_title")}</Label>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.cabys_section_description")}
          </p>
        </div>

        <CabysSearchInput
          onChange={(result) => {
            form.setValue("cabys_code", result?.codigo ?? "", { shouldDirty: true });
            form.setValue("cabys_descripcion", result?.descripcion ?? "", { shouldDirty: true });
            form.setValue("cabys_impuesto", result?.impuesto ?? null, { shouldDirty: true });
          }}
          value={currentCabys}
        />

        {cabysCode ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              {t(taxProfileItemKindTranslationMap[itemKind] ?? "inventory.common.not_available")}
            </Badge>
          </div>
        ) : null}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("inventory.form.active_category")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_category_description")}
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

export { ProductCategoryForm };
export type { ProductCategoryFormProps };
