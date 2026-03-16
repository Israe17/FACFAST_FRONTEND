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
  const form = useForm<CreateProductPriceInput>({
    defaultValues: productPrice ? getProductPriceFormValues(productPrice) : emptyProductPriceFormValues,
    resolver: buildFormResolver<CreateProductPriceInput>(createProductPriceSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = productPrice ? updateMutation : createMutation;

  useEffect(() => {
    form.reset(productPrice ? getProductPriceFormValues(productPrice) : emptyProductPriceFormValues);
    resetBackendFormErrors();
  }, [form, open, productPrice, resetBackendFormErrors]);

  async function handleSubmit(values: CreateProductPriceInput) {
    resetBackendFormErrors();

    if (!productId) {
      return;
    }

    try {
      if (productPrice) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          productPrice
            ? "inventory.product_price_update_error_fallback"
            : "inventory.product_price_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {productPrice
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.product_price"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product_price"),
                })}
          </DialogTitle>
          <DialogDescription>
            {t("inventory.product_prices.dialog_description", {
              product: product?.name ?? t("inventory.entity.product"),
            })}
          </DialogDescription>
        </DialogHeader>
        <ProductPriceForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          priceLists={priceLists}
          submitLabel={
            productPrice
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product_price"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export { ProductPriceDialog };
