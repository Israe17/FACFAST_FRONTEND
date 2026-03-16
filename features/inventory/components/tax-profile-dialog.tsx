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
  const createTaxProfileMutation = useCreateTaxProfileMutation({ showErrorToast: false });
  const updateTaxProfileMutation = useUpdateTaxProfileMutation(taxProfile?.id ?? "", {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<CreateTaxProfileInput>({
    defaultValues: taxProfile ? getTaxProfileFormValues(taxProfile) : emptyTaxProfileFormValues,
    resolver: buildFormResolver<CreateTaxProfileInput>(createTaxProfileSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = taxProfile ? updateTaxProfileMutation : createTaxProfileMutation;

  useEffect(() => {
    form.reset(taxProfile ? getTaxProfileFormValues(taxProfile) : emptyTaxProfileFormValues);
    resetBackendFormErrors();
  }, [form, open, resetBackendFormErrors, taxProfile]);

  async function handleSubmit(values: CreateTaxProfileInput) {
    resetBackendFormErrors();

    try {
      if (taxProfile) {
        await updateTaxProfileMutation.mutateAsync(values);
      } else {
        await createTaxProfileMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          taxProfile
            ? "inventory.tax_profile_update_error_fallback"
            : "inventory.tax_profile_create_error_fallback",
        ),
      });
    }
  }

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
          isPending={activeMutation.isPending}
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
