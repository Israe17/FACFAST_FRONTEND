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

import { emptySaleOrderFormValues, getSaleOrderFormValues } from "../form-values";
import { useCreateSaleOrderMutation, useUpdateSaleOrderMutation } from "../queries";
import { createSaleOrderSchema } from "../schemas";
import type { SaleOrder, CreateSaleOrderInput } from "../types";
import { SaleOrderForm } from "./sale-order-form";

type SaleOrderDialogProps = {
  order?: SaleOrder | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function SaleOrderDialog({ order, onOpenChange, open }: SaleOrderDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateSaleOrderMutation({ showErrorToast: false });
  const updateMutation = useUpdateSaleOrderMutation(order?.id ?? "", { showErrorToast: false });

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateSaleOrderInput, SaleOrder>({
    open,
    onOpenChange,
    schema: createSaleOrderSchema,
    defaultValues: emptySaleOrderFormValues,
    entity: order,
    mapEntityToForm: getSaleOrderFormValues,
    mutation: order ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      order ? "sales.order_update_error_fallback" : "sales.order_create_error_fallback",
    ),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {order
              ? t("inventory.common.edit_entity", { entity: t("sales.entity.sale_order") })
              : t("inventory.common.create_entity", { entity: t("sales.entity.sale_order") })}
          </DialogTitle>
          <DialogDescription>{t("sales.dialog_description")}</DialogDescription>
        </DialogHeader>
        <SaleOrderForm
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitLabel={
            order
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", { entity: t("sales.entity.sale_order") })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export { SaleOrderDialog };
