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

import { emptyMeasurementUnitFormValues, getMeasurementUnitFormValues } from "../form-values";
import { useCreateMeasurementUnitMutation, useUpdateMeasurementUnitMutation } from "../queries";
import { createMeasurementUnitSchema } from "../schemas";
import type { CreateMeasurementUnitInput, MeasurementUnit } from "../types";
import { MeasurementUnitForm } from "./measurement-unit-form";

type MeasurementUnitDialogProps = {
  measurementUnit?: MeasurementUnit | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function MeasurementUnitDialog({ measurementUnit, onOpenChange, open }: MeasurementUnitDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateMeasurementUnitMutation({ showErrorToast: false });
  const updateMutation = useUpdateMeasurementUnitMutation(measurementUnit?.id ?? "", { showErrorToast: false });

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateMeasurementUnitInput, MeasurementUnit>({
    open,
    onOpenChange,
    schema: createMeasurementUnitSchema,
    defaultValues: emptyMeasurementUnitFormValues,
    entity: measurementUnit,
    mapEntityToForm: getMeasurementUnitFormValues,
    mutation: measurementUnit ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      measurementUnit
        ? "inventory.measurement_unit_update_error_fallback"
        : "inventory.measurement_unit_create_error_fallback",
    ),
  });

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {measurementUnit
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.measurement_unit"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.measurement_unit"),
                })}
          </DrawerTitle>
          <DrawerDescription>{t("inventory.measurement_units.dialog_description")}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <MeasurementUnitForm
            form={form}
            formError={formError}
            isPending={isPending}
            onSubmit={handleSubmit}
            submitLabel={
              measurementUnit
                ? t("inventory.common.save_changes")
                : t("inventory.common.create_entity", {
                    entity: t("inventory.entity.measurement_unit"),
                  })
            }
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export { MeasurementUnitDialog };
