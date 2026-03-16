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
  const createPriceListMutation = useCreatePriceListMutation({ showErrorToast: false });
  const updatePriceListMutation = useUpdatePriceListMutation(priceList?.id ?? "", {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<CreatePriceListInput>({
    defaultValues: priceList ? getPriceListFormValues(priceList) : emptyPriceListFormValues,
    resolver: buildFormResolver<CreatePriceListInput>(createPriceListSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = priceList ? updatePriceListMutation : createPriceListMutation;

  useEffect(() => {
    form.reset(priceList ? getPriceListFormValues(priceList) : emptyPriceListFormValues);
    resetBackendFormErrors();
  }, [form, open, priceList, resetBackendFormErrors]);

  async function handleSubmit(values: CreatePriceListInput) {
    resetBackendFormErrors();

    try {
      if (priceList) {
        await updatePriceListMutation.mutateAsync(values);
      } else {
        await createPriceListMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          priceList
            ? "inventory.price_list_update_error_fallback"
            : "inventory.price_list_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {priceList
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.price_list"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.price_list"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.price_lists.dialog_description")}</DialogDescription>
        </DialogHeader>
        <PriceListForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            priceList
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.price_list"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export { PriceListDialog };
