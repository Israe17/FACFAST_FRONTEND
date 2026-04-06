"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";

import { emptyPriceListFormValues, getPriceListFormValues } from "../form-values";
import {
  useCreatePriceListMutation,
  useUpdatePriceListMutation,
} from "../queries";
import { createPriceListSchema } from "../schemas";
import type { CreatePriceListInput, PriceList } from "../types";
import { PriceListForm } from "./price-list-form";

type PriceListDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  priceList?: PriceList | null;
};

function PriceListDialog({ onOpenChange, open, priceList }: PriceListDialogProps) {
  const { t } = useAppTranslator();
  const createPriceListMutation = useCreatePriceListMutation({ showErrorToast: false });
  const updatePriceListMutation = useUpdatePriceListMutation(priceList?.id ?? "", {
    showErrorToast: false,
  });

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreatePriceListInput, PriceList>({
    open,
    onOpenChange,
    schema: createPriceListSchema,
    defaultValues: emptyPriceListFormValues,
    entity: priceList,
    mapEntityToForm: getPriceListFormValues,
    mutation: priceList ? updatePriceListMutation : createPriceListMutation,
    fallbackErrorMessage: t(
      priceList
        ? "inventory.price_list_update_error_fallback"
        : "inventory.price_list_create_error_fallback",
    ),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {priceList
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.price_list"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.price_list"),
                })}
          </SheetTitle>
          <SheetDescription>{t("inventory.price_lists.dialog_description")}</SheetDescription>
        </SheetHeader>
        <PriceListForm
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitLabel={
            priceList
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.price_list"),
                })
          }
        />
      </SheetContent>
    </Sheet>
  );
}

export { PriceListDialog };
