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

import { emptyZoneFormValues, getZoneFormValues } from "../form-values";
import { useCreateZoneMutation, useUpdateZoneMutation } from "../queries";
import { createZoneSchema } from "../schemas";
import type { Zone, CreateZoneInput } from "../types";
import { ZoneForm } from "./zone-form";

type ZoneDialogProps = {
  zone?: Zone | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function ZoneDialog({ zone, onOpenChange, open }: ZoneDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateZoneMutation({ showErrorToast: false });
  const updateMutation = useUpdateZoneMutation(zone?.id ?? "", { showErrorToast: false });

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateZoneInput, Zone>({
    open,
    onOpenChange,
    schema: createZoneSchema,
    defaultValues: emptyZoneFormValues,
    entity: zone,
    mapEntityToForm: getZoneFormValues,
    mutation: zone ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      zone ? "inventory.zone_update_error_fallback" : "inventory.zone_create_error_fallback",
    ),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {zone
              ? t("inventory.common.edit_entity", { entity: t("inventory.entity.zone") })
              : t("inventory.common.create_entity", { entity: t("inventory.entity.zone") })}
          </DialogTitle>
          <DialogDescription>{t("inventory.zones.dialog_description")}</DialogDescription>
        </DialogHeader>
        <ZoneForm
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitLabel={
            zone
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", { entity: t("inventory.entity.zone") })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export { ZoneDialog };
