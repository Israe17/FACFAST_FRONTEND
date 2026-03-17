"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";

import { emptyProductFormValues, getProductFormValues } from "../form-values";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../queries";
import { createProductSchema } from "../schemas";
import type {
  Brand,
  CreateProductInput,
  MeasurementUnit,
  Product,
  ProductCategory,
  TaxProfile,
  WarrantyProfile,
} from "../types";
import { ProductForm } from "./product-form";

type ProductDialogProps = {
  brands: Brand[];
  categories: ProductCategory[];
  measurementUnits: MeasurementUnit[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product?: Product | null;
  taxProfiles: TaxProfile[];
  warrantyProfiles: WarrantyProfile[];
};

function ProductDialog({
  brands,
  categories,
  measurementUnits,
  onOpenChange,
  open,
  product,
  taxProfiles,
  warrantyProfiles,
}: ProductDialogProps) {
  const createProductMutation = useCreateProductMutation({ showErrorToast: false });
  const updateProductMutation = useUpdateProductMutation(product?.id ?? "", {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateProductInput, Product>({
    open,
    onOpenChange,
    schema: createProductSchema,
    defaultValues: emptyProductFormValues,
    entity: product,
    mapEntityToForm: getProductFormValues,
    mutation: product ? updateProductMutation : createProductMutation,
    fallbackErrorMessage: t(
      product
        ? "inventory.product_update_error_fallback"
        : "inventory.product_create_error_fallback",
    ),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {product
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.product"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.products.dialog_description")}</DialogDescription>
        </DialogHeader>
        <ProductForm
          brands={brands}
          categories={categories}
          form={form}
          formError={formError}
          isPending={isPending}
          measurementUnits={measurementUnits}
          onSubmit={handleSubmit}
          submitLabel={
            product
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product"),
                })
          }
          taxProfiles={taxProfiles}
          warrantyProfiles={warrantyProfiles}
        />
      </DialogContent>
    </Dialog>
  );
}

export { ProductDialog };
export type { ProductDialogProps };
