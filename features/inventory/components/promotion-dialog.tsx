"use client";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent size="lg">
        <SheetHeader>
          <SheetTitle>
            {promotion
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.promotion"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.promotion"),
                })}
          </SheetTitle>
          <SheetDescription>{t("inventory.promotions.dialog_description")}</SheetDescription>
        </SheetHeader>
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
      </SheetContent>
    </Sheet>
  );
}

export { PromotionDialog };
