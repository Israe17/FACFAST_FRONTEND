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
  emptyDispatchOrderFormValues,
  getDispatchOrderFormValues,
} from "../form-values";
import {
  useCreateDispatchOrderMutation,
  useUpdateDispatchOrderMutation,
} from "../queries";
import { createDispatchOrderSchema } from "../schemas";
import type { DispatchOrder, CreateDispatchOrderInput } from "../types";
import { DispatchOrderForm } from "./dispatch-order-form";

type DispatchOrderDialogProps = {
  order?: DispatchOrder | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function DispatchOrderDialog({ order, onOpenChange, open }: DispatchOrderDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateDispatchOrderMutation({ showErrorToast: false });
  const updateMutation = useUpdateDispatchOrderMutation(order?.id ?? "", {
    showErrorToast: false,
  });

  const { form, formError, handleSubmit, isPending } = useDialogForm<
    CreateDispatchOrderInput,
    DispatchOrder
  >({
    open,
    onOpenChange,
    schema: createDispatchOrderSchema,
    defaultValues: emptyDispatchOrderFormValues,
    entity: order,
    mapEntityToForm: getDispatchOrderFormValues,
    mutation: order ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      order
        ? "inventory.dispatch_order_update_error_fallback"
        : "inventory.dispatch_order_create_error_fallback",
    ),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {order
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.dispatch_order"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.dispatch_order"),
                })}
          </DialogTitle>
          <DialogDescription>
            {t("inventory.dispatch.dialog_description")}
          </DialogDescription>
        </DialogHeader>
        <DispatchOrderForm
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitLabel={
            order
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.dispatch_order"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export { DispatchOrderDialog };
