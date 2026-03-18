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

import {
  emptyProductVariantFormValues,
  getProductVariantFormValues,
} from "../form-values";
import {
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
} from "../queries";
import { createProductVariantSchema } from "../schemas";
import type {
  CreateProductVariantInput,
  MeasurementUnit,
  ProductVariant,
  TaxProfile,
  WarrantyProfile,
} from "../types";
import { ProductVariantForm } from "./product-variant-form";

type ProductVariantDialogProps = {
  measurementUnits: MeasurementUnit[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  productId: string;
  taxProfiles: TaxProfile[];
  variant?: ProductVariant | null;
  warrantyProfiles: WarrantyProfile[];
};

function ProductVariantDialog({
  measurementUnits,
  onOpenChange,
  open,
  productId,
  taxProfiles,
  variant,
  warrantyProfiles,
}: ProductVariantDialogProps) {
  const createMutation = useCreateProductVariantMutation(productId, {
    showErrorToast: false,
  });
  const updateMutation = useUpdateProductVariantMutation(
    productId,
    variant?.id ?? "",
    { showErrorToast: false },
  );
  const { t } = useAppTranslator();

  const { form, formError, handleSubmit, isPending } = useDialogForm<
    CreateProductVariantInput,
    ProductVariant
  >({
    open,
    onOpenChange,
    schema: createProductVariantSchema,
    defaultValues: emptyProductVariantFormValues,
    entity: variant,
    mapEntityToForm: getProductVariantFormValues,
    mutation: variant ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      variant
        ? "inventory.variant_update_error_fallback"
        : "inventory.variant_create_error_fallback",
    ),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {variant
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.variant"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.variant"),
                })}
          </DialogTitle>
          <DialogDescription>
            {t("inventory.variants.dialog_description")}
          </DialogDescription>
        </DialogHeader>
        <ProductVariantForm
          form={form}
          formError={formError}
          isPending={isPending}
          measurementUnits={measurementUnits}
          onSubmit={handleSubmit}
          submitLabel={
            variant
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.variant"),
                })
          }
          taxProfiles={taxProfiles}
          warrantyProfiles={warrantyProfiles}
        />
      </DialogContent>
    </Dialog>
  );
}

export { ProductVariantDialog };
