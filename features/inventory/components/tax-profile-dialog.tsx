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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {taxProfile
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.tax_profile"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.tax_profile"),
                })}
          </SheetTitle>
          <SheetDescription>{t("inventory.tax_profiles.dialog_description")}</SheetDescription>
        </SheetHeader>
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
      </SheetContent>
    </Sheet>
  );
}

export { TaxProfileDialog };
