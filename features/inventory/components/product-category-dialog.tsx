"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";

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
  const { t } = useAppTranslator();
  const createCategoryMutation = useCreateProductCategoryMutation({ showErrorToast: false });
  const updateCategoryMutation = useUpdateProductCategoryMutation(category?.id ?? "", {
    showErrorToast: false,
  });

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateProductCategoryInput, ProductCategory>({
    open,
    onOpenChange,
    schema: createProductCategorySchema,
    defaultValues: emptyProductCategoryFormValues,
    entity: category,
    mapEntityToForm: getProductCategoryFormValues,
    mutation: category ? updateCategoryMutation : createCategoryMutation,
    fallbackErrorMessage: t(
      category
        ? "inventory.category_update_error_fallback"
        : "inventory.category_create_error_fallback",
    ),
  });

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {category
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.product_category"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product_category"),
                })}
          </DrawerTitle>
          <DrawerDescription>{t("inventory.categories.dialog_description")}</DrawerDescription>
        </DrawerHeader>
        <ProductCategoryForm
          categories={categories}
          currentCategoryId={category?.id}
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitLabel={
            category
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product_category"),
                })
          }
        />
      </DrawerContent>
    </Drawer>
  );
}

export { ProductCategoryDialog };
