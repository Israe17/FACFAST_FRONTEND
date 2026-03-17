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

import { emptyTaxProfileFormValues, getTaxProfileFormValues } from "../form-values";
import {
  useCreateTaxProfileMutation,
  useUpdateTaxProfileMutation,
} from "../queries";
import { createTaxProfileSchema } from "../schemas";
import type { CreateTaxProfileInput, TaxProfile } from "../types";
import { TaxProfileForm } from "./tax-profile-form";

type TaxProfileDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  taxProfile?: TaxProfile | null;
};

function TaxProfileDialog({ onOpenChange, open, taxProfile }: TaxProfileDialogProps) {
  const { t } = useAppTranslator();
  const createTaxProfileMutation = useCreateTaxProfileMutation({ showErrorToast: false });
  const updateTaxProfileMutation = useUpdateTaxProfileMutation(taxProfile?.id ?? "", {
    showErrorToast: false,
  });

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateTaxProfileInput, TaxProfile>({
    open,
    onOpenChange,
    schema: createTaxProfileSchema,
    defaultValues: emptyTaxProfileFormValues,
    entity: taxProfile,
    mapEntityToForm: getTaxProfileFormValues,
    mutation: taxProfile ? updateTaxProfileMutation : createTaxProfileMutation,
    fallbackErrorMessage: t(
      taxProfile
        ? "inventory.tax_profile_update_error_fallback"
        : "inventory.tax_profile_create_error_fallback",
    ),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {taxProfile
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.tax_profile"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.tax_profile"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.tax_profiles.dialog_description")}</DialogDescription>
        </DialogHeader>
        <TaxProfileForm
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitLabel={
            taxProfile
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.tax_profile"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export { TaxProfileDialog };
