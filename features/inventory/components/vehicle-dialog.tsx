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

import { emptyVehicleFormValues, getVehicleFormValues } from "../form-values";
import { useCreateVehicleMutation, useUpdateVehicleMutation } from "../queries";
import { createVehicleSchema } from "../schemas";
import type { Vehicle, CreateVehicleInput } from "../types";
import { VehicleForm } from "./vehicle-form";

type VehicleDialogProps = {
  vehicle?: Vehicle | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function VehicleDialog({ vehicle, onOpenChange, open }: VehicleDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateVehicleMutation({ showErrorToast: false });
  const updateMutation = useUpdateVehicleMutation(vehicle?.id ?? "", { showErrorToast: false });

  const { form, formError, handleSubmit, isPending } = useDialogForm<
    CreateVehicleInput,
    Vehicle
  >({
    open,
    onOpenChange,
    schema: createVehicleSchema,
    defaultValues: emptyVehicleFormValues,
    entity: vehicle,
    mapEntityToForm: getVehicleFormValues,
    mutation: vehicle ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      vehicle
        ? "inventory.vehicle_update_error_fallback"
        : "inventory.vehicle_create_error_fallback",
    ),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {vehicle
              ? t("inventory.common.edit_entity", { entity: t("inventory.entity.vehicle") })
              : t("inventory.common.create_entity", { entity: t("inventory.entity.vehicle") })}
          </SheetTitle>
          <SheetDescription>{t("inventory.vehicles.dialog_description")}</SheetDescription>
        </SheetHeader>
        <VehicleForm
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitLabel={
            vehicle
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", { entity: t("inventory.entity.vehicle") })
          }
        />
      </SheetContent>
    </Sheet>
  );
}

export { VehicleDialog };
