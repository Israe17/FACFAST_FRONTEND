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
  emptyPromotionFormValues,
  getPromotionFormValues,
} from "../form-values";
import {
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
} from "../queries";
import { createPromotionSchema } from "../schemas";
import type { CreatePromotionInput, Product, Promotion } from "../types";
import { PromotionForm } from "./promotion-form";

type PromotionDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  products: Product[];
  promotion?: Promotion | null;
};

function PromotionDialog({ onOpenChange, open, products, promotion }: PromotionDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreatePromotionMutation({ showErrorToast: false });
  const updateMutation = useUpdatePromotionMutation(promotion?.id ?? "", {
    showErrorToast: false,
  });

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreatePromotionInput, Promotion>({
    open,
    onOpenChange,
    schema: createPromotionSchema,
    defaultValues: emptyPromotionFormValues,
    entity: promotion,
    mapEntityToForm: getPromotionFormValues,
    mutation: promotion ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      promotion
        ? "inventory.promotion_update_error_fallback"
        : "inventory.promotion_create_error_fallback",
    ),
  });

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="sm:max-w-3xl">
        <DrawerHeader>
          <DrawerTitle>
            {promotion
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.promotion"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.promotion"),
                })}
          </DrawerTitle>
          <DrawerDescription>{t("inventory.promotions.dialog_description")}</DrawerDescription>
        </DrawerHeader>
        <PromotionForm
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          products={products}
          submitLabel={
            promotion
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.promotion"),
                })
          }
        />
      </DrawerContent>
    </Drawer>
  );
}

export { PromotionDialog };
