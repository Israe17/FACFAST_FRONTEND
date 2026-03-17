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
  const { t } = useAppTranslator();
  const createWarrantyProfileMutation = useCreateWarrantyProfileMutation({
    showErrorToast: false,
  });
  const updateWarrantyProfileMutation = useUpdateWarrantyProfileMutation(
    warrantyProfile?.id ?? "",
    { showErrorToast: false },
  );

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateWarrantyProfileInput, WarrantyProfile>({
    open,
    onOpenChange,
    schema: createWarrantyProfileSchema,
    defaultValues: emptyWarrantyProfileFormValues,
    entity: warrantyProfile,
    mapEntityToForm: getWarrantyProfileFormValues,
    mutation: warrantyProfile ? updateWarrantyProfileMutation : createWarrantyProfileMutation,
    fallbackErrorMessage: t(
      warrantyProfile
        ? "inventory.warranty_profile_update_error_fallback"
        : "inventory.warranty_profile_create_error_fallback",
    ),
  });

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
          isPending={isPending}
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
