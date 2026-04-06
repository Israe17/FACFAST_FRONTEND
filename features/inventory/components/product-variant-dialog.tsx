"use client";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>
            {variant
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.variant"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.variant"),
                })}
          </DrawerTitle>
          <DrawerDescription>
            {t("inventory.variants.dialog_description")}
          </DrawerDescription>
        </DrawerHeader>
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
      </DrawerContent>
    </Drawer>
  );
}

export { ProductVariantDialog };
