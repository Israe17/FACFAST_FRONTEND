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
  emptyWarrantyProfileFormValues,
  getWarrantyProfileFormValues,
} from "../form-values";
import {
  useCreateWarrantyProfileMutation,
  useUpdateWarrantyProfileMutation,
} from "../queries";
import { createWarrantyProfileSchema } from "../schemas";
import type { CreateWarrantyProfileInput, WarrantyProfile } from "../types";
import { WarrantyProfileForm } from "./warranty-profile-form";

type WarrantyProfileDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  warrantyProfile?: WarrantyProfile | null;
};

function WarrantyProfileDialog({
  onOpenChange,
  open,
  warrantyProfile,
}: WarrantyProfileDialogProps) {
  const createWarrantyProfileMutation = useCreateWarrantyProfileMutation({
    showErrorToast: false,
  });
  const updateWarrantyProfileMutation = useUpdateWarrantyProfileMutation(
    warrantyProfile?.id ?? "",
    { showErrorToast: false },
  );
  const { t } = useAppTranslator();
  const form = useForm<CreateWarrantyProfileInput>({
    defaultValues: warrantyProfile
      ? getWarrantyProfileFormValues(warrantyProfile)
      : emptyWarrantyProfileFormValues,
    resolver: buildFormResolver<CreateWarrantyProfileInput>(createWarrantyProfileSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = warrantyProfile
    ? updateWarrantyProfileMutation
    : createWarrantyProfileMutation;

  useEffect(() => {
    form.reset(
      warrantyProfile
        ? getWarrantyProfileFormValues(warrantyProfile)
        : emptyWarrantyProfileFormValues,
    );
    resetBackendFormErrors();
  }, [form, open, resetBackendFormErrors, warrantyProfile]);

  async function handleSubmit(values: CreateWarrantyProfileInput) {
    resetBackendFormErrors();

    try {
      if (warrantyProfile) {
        await updateWarrantyProfileMutation.mutateAsync(values);
      } else {
        await createWarrantyProfileMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          warrantyProfile
            ? "inventory.warranty_profile_update_error_fallback"
            : "inventory.warranty_profile_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {warrantyProfile
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.warranty_profile"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warranty_profile"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.warranty_profiles.dialog_description")}</DialogDescription>
        </DialogHeader>
        <WarrantyProfileForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            warrantyProfile
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warranty_profile"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export { WarrantyProfileDialog };
