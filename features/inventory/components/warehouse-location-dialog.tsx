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
  const form = useForm<CreateWarehouseLocationInput>({
    defaultValues: location ? getWarehouseLocationFormValues(location) : emptyWarehouseLocationFormValues,
    resolver: buildFormResolver<CreateWarehouseLocationInput>(createWarehouseLocationSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = location ? updateMutation : createMutation;

  useEffect(() => {
    form.reset(location ? getWarehouseLocationFormValues(location) : emptyWarehouseLocationFormValues);
    resetBackendFormErrors();
  }, [form, location, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateWarehouseLocationInput) {
    resetBackendFormErrors();

    if (!warehouseId) {
      return;
    }

    try {
      if (location) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          location
            ? "inventory.warehouse_location_update_error_fallback"
            : "inventory.warehouse_location_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {location
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.warehouse_location"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse_location"),
                })}
          </DialogTitle>
          <DialogDescription>
            {t("inventory.warehouse_locations.dialog_description", {
              warehouse: warehouse?.name ?? t("inventory.entity.warehouse"),
            })}
          </DialogDescription>
        </DialogHeader>
        <WarehouseLocationForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            location
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse_location"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export { WarehouseLocationDialog };
