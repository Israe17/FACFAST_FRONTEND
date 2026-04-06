"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {zone
              ? t("inventory.common.edit_entity", { entity: t("inventory.entity.zone") })
              : t("inventory.common.create_entity", { entity: t("inventory.entity.zone") })}
          </DrawerTitle>
          <DrawerDescription>{t("inventory.zones.dialog_description")}</DrawerDescription>
        </DrawerHeader>
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
      </DrawerContent>
    </Drawer>
  );
}

export { ZoneDialog };
