"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DataTable } from "@/shared/components/data-table";
import { ErrorState } from "@/shared/components/error-state";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { formatDateTime } from "@/shared/lib/utils";

import {
  emptyProductCategoryFormValues,
  getProductCategoryFormValues,
} from "../form-values";
import {
  useCreateProductCategoryMutation,
  useProductCategoriesQuery,
  useUpdateProductCategoryMutation,
} from "../queries";
import { createProductCategorySchema } from "../schemas";
import type { CreateProductCategoryInput, ProductCategory } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

const EMPTY_PARENT_VALUE = "__none__";

type ProductCategoriesSectionProps = {
  enabled?: boolean;
};

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
  const availableParents = categories.filter((category) => category.id !== currentCategoryId);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category-code">{t("inventory.common.code")}</Label>
          <Input id="category-code" placeholder="CG-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-name">{t("inventory.common.name")}</Label>
          <Input
            id="category-name"
            placeholder={t("inventory.entity.product_category")}
            {...form.register("name")}
          />
          <FormFieldError message={errors.name?.message} />
        </div>
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

type ProductCategoryDialogProps = {
  categories: ProductCategory[];
  category?: ProductCategory | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function ProductCategoryDialog({
  categories,
  category,
  onOpenChange,
  open,
}: ProductCategoryDialogProps) {
  const createCategoryMutation = useCreateProductCategoryMutation({ showErrorToast: false });
  const updateCategoryMutation = useUpdateProductCategoryMutation(category?.id ?? "", {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<CreateProductCategoryInput>({
    defaultValues: category
      ? getProductCategoryFormValues(category)
      : emptyProductCategoryFormValues,
    resolver: buildFormResolver<CreateProductCategoryInput>(createProductCategorySchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = category ? updateCategoryMutation : createCategoryMutation;

  useEffect(() => {
    form.reset(category ? getProductCategoryFormValues(category) : emptyProductCategoryFormValues);
    resetBackendFormErrors();
  }, [category, form, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateProductCategoryInput) {
    resetBackendFormErrors();

    try {
      if (category) {
        await updateCategoryMutation.mutateAsync(values);
      } else {
        await createCategoryMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          category
            ? "inventory.category_update_error_fallback"
            : "inventory.category_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.product_category"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product_category"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.categories.dialog_description")}</DialogDescription>
        </DialogHeader>
        <ProductCategoryForm
          categories={categories}
          currentCategoryId={category?.id}
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            category
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product_category"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function ProductCategoriesSection({ enabled = true }: ProductCategoriesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("categories.view");
  const canCreate = can("categories.create");
  const canUpdate = can("categories.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const categoriesQuery = useProductCategoriesQuery(enabled && canView);

  const parentNameById = useMemo(() => {
    return new Map((categoriesQuery.data ?? []).map((category) => [category.id, category.name]));
  }, [categoriesQuery.data]);

  const columns = useMemo<ColumnDef<ProductCategory>[]>(() => {
    const baseColumns: ColumnDef<ProductCategory>[] = [
      {
        accessorKey: "name",
        header: t("inventory.entity.category"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{row.original.name}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.code
                ? `${t("inventory.common.code")}: ${row.original.code}`
                : t("inventory.common.no_manual_code")}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "parent_id",
        header: t("inventory.common.parent"),
        cell: ({ row }) =>
          row.original.parent_id
            ? parentNameById.get(row.original.parent_id) ?? t("inventory.common.unknown")
            : t("inventory.common.root"),
      },
      {
        accessorKey: "level",
        header: t("inventory.common.level"),
        cell: ({ row }) => row.original.level ?? 0,
      },
      {
        accessorKey: "updated_at",
        header: t("inventory.common.updated"),
        cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
      },
    ];

    if (canUpdate) {
      baseColumns.push({
        id: "actions",
        header: t("inventory.common.actions"),
        cell: ({ row }) => (
          <Button
            onClick={() => {
              setSelectedCategory(row.original);
              setDialogOpen(true);
            }}
            size="sm"
            variant="outline"
          >
            <Pencil className="size-4" />
            {t("inventory.common.edit")}
          </Button>
        ),
      });
    }

    return baseColumns;
  }, [canUpdate, parentNameById, t]);

  if (!canView) {
    return null;
  }

  return (
    <>
      <CatalogSectionCard
        action={
          canCreate ? (
            <Button
              onClick={() => {
                setSelectedCategory(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.product_category"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.categories.section_description")}
        title={t("inventory.entity.product_categories")}
      >
        {categoriesQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.product_categories"),
            })}
          />
        ) : null}
        {categoriesQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              categoriesQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.product_categories"),
              }),
            )}
            onRetry={() => categoriesQuery.refetch()}
          />
        ) : null}
        {!categoriesQuery.isLoading && !categoriesQuery.isError ? (
          <DataTable
            columns={columns}
            data={categoriesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.product_categories"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <ProductCategoryDialog
        categories={categoriesQuery.data ?? []}
        category={selectedCategory}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedCategory(null);
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}

export { ProductCategoriesSection };
