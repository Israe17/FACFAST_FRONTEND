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
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>
            {taxProfile
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.tax_profile"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.tax_profile"),
                })}
          </DrawerTitle>
          <DrawerDescription>{t("inventory.tax_profiles.dialog_description")}</DrawerDescription>
        </DrawerHeader>
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
      </DrawerContent>
    </Drawer>
  );
}

export { TaxProfileDialog };
