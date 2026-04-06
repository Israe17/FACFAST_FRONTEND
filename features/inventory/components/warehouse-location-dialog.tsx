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

import {
  emptyWarehouseLocationFormValues,
  getWarehouseLocationFormValues,
} from "../form-values";
import {
  useCreateWarehouseLocationMutation,
  useUpdateWarehouseLocationMutation,
} from "../queries";
import { createWarehouseLocationSchema } from "../schemas";
import type {
  CreateWarehouseLocationInput,
  Warehouse,
  WarehouseLocation,
} from "../types";
import { WarehouseLocationForm } from "./warehouse-location-form";

type WarehouseLocationDialogProps = {
  location?: WarehouseLocation | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  warehouse?: Warehouse | null;
};

function WarehouseLocationDialog({
  location,
  onOpenChange,
  open,
  warehouse,
}: WarehouseLocationDialogProps) {
  const warehouseId = warehouse?.id ?? "";
  const createMutation = useCreateWarehouseLocationMutation(warehouseId, { showErrorToast: false });
  const updateMutation = useUpdateWarehouseLocationMutation(location?.id ?? "", warehouseId, {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateWarehouseLocationInput, WarehouseLocation>({
    open,
    onOpenChange,
    schema: createWarehouseLocationSchema,
    defaultValues: emptyWarehouseLocationFormValues,
    entity: location,
    mapEntityToForm: getWarehouseLocationFormValues,
    mutation: location ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      location
        ? "inventory.warehouse_location_update_error_fallback"
        : "inventory.warehouse_location_create_error_fallback",
    ),
  });

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>
            {location
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.warehouse_location"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse_location"),
                })}
          </DrawerTitle>
          <DrawerDescription>
            {t("inventory.warehouse_locations.dialog_description", {
              warehouse: warehouse?.name ?? t("inventory.entity.warehouse"),
            })}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <WarehouseLocationForm
            form={form}
            formError={formError}
            isPending={isPending}
            onSubmit={handleSubmit}
            submitLabel={
              location
                ? t("inventory.common.save_changes")
                : t("inventory.common.create_entity", {
                    entity: t("inventory.entity.warehouse_location"),
                  })
            }
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export { WarehouseLocationDialog };
