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
  const createMutation = useCreatePromotionMutation({ showErrorToast: false });
  const updateMutation = useUpdatePromotionMutation(promotion?.id ?? "", {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<CreatePromotionInput>({
    defaultValues: promotion ? getPromotionFormValues(promotion) : emptyPromotionFormValues,
    resolver: buildFormResolver<CreatePromotionInput>(createPromotionSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = promotion ? updateMutation : createMutation;

  useEffect(() => {
    form.reset(promotion ? getPromotionFormValues(promotion) : emptyPromotionFormValues);
    resetBackendFormErrors();
  }, [form, open, promotion, resetBackendFormErrors]);

  async function handleSubmit(values: CreatePromotionInput) {
    resetBackendFormErrors();

    try {
      if (promotion) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          promotion
            ? "inventory.promotion_update_error_fallback"
            : "inventory.promotion_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {promotion
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.promotion"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.promotion"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.promotions.dialog_description")}</DialogDescription>
        </DialogHeader>
        <PromotionForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
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
      </DialogContent>
    </Dialog>
  );
}

export { PromotionDialog };
