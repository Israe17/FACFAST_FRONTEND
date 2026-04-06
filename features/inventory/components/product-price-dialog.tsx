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
  emptyProductPriceFormValues,
  getProductPriceFormValues,
} from "../form-values";
import {
  useCreateProductPriceMutation,
  useUpdateProductPriceMutation,
} from "../queries";
import { createProductPriceSchema } from "../schemas";
import type {
  CreateProductPriceInput,
  PriceList,
  Product,
  ProductPrice,
} from "../types";
import { ProductPriceForm } from "./product-price-form";

type ProductPriceDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  priceLists: PriceList[];
  product?: Product | null;
  productPrice?: ProductPrice | null;
};

function ProductPriceDialog({
  onOpenChange,
  open,
  priceLists,
  product,
  productPrice,
}: ProductPriceDialogProps) {
  const productId = product?.id ?? "";
  const createMutation = useCreateProductPriceMutation(productId, { showErrorToast: false });
  const updateMutation = useUpdateProductPriceMutation(productPrice?.id ?? "", productId, {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateProductPriceInput, ProductPrice>({
    open,
    onOpenChange,
    schema: createProductPriceSchema,
    defaultValues: emptyProductPriceFormValues,
    entity: productPrice,
    mapEntityToForm: getProductPriceFormValues,
    mutation: productPrice ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      productPrice
        ? "inventory.product_price_update_error_fallback"
        : "inventory.product_price_create_error_fallback",
    ),
  });

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {productPrice
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.product_price"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product_price"),
                })}
          </DrawerTitle>
          <DrawerDescription>
            {t("inventory.product_prices.dialog_description", {
              product: product?.name ?? t("inventory.entity.product"),
            })}
          </DrawerDescription>
        </DrawerHeader>
        <ProductPriceForm
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          priceLists={priceLists}
          product={product}
          submitLabel={
            productPrice
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product_price"),
                })
          }
        />
      </DrawerContent>
    </Drawer>
  );
}

export { ProductPriceDialog };
