"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import {
  emptyProductCategoryFormValues,
  getProductCategoryFormValues,
} from "../form-values";
import {
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
} from "../queries";
import { createProductCategorySchema } from "../schemas";
import type { CreateProductCategoryInput, ProductCategory } from "../types";
import { ProductCategoryForm } from "./product-category-form";

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

export { ProductCategoryDialog };
