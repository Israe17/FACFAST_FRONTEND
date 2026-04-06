"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import type { Contact } from "@/features/contacts/types";

import {
  emptyInventoryLotFormValues,
  getInventoryLotFormValues,
} from "../form-values";
import {
  useCreateInventoryLotMutation,
  useUpdateInventoryLotMutation,
  useWarehouseLocationsQuery,
} from "../queries";
import { createInventoryLotSchema } from "../schemas";
import type { CreateInventoryLotInput, InventoryLot, Product, Warehouse } from "../types";
import { InventoryLotForm } from "./inventory-lot-form";

type InventoryLotDialogProps = {
  lot?: InventoryLot | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  products: Product[];
  suppliers: Contact[];
  warehouses: Warehouse[];
};

function InventoryLotDialog({
  lot,
  onOpenChange,
  open,
  products,
  suppliers,
  warehouses,
}: InventoryLotDialogProps) {
  const createMutation = useCreateInventoryLotMutation({ showErrorToast: false });
  const updateMutation = useUpdateInventoryLotMutation(lot?.id ?? "", { showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<CreateInventoryLotInput>({
    defaultValues: lot ? getInventoryLotFormValues(lot) : emptyInventoryLotFormValues,
    resolver: buildFormResolver<CreateInventoryLotInput>(createInventoryLotSchema),
  });
  const watchedWarehouseId = useWatch({
    control: form.control,
    name: "warehouse_id",
  });
  const locationsQuery = useWarehouseLocationsQuery(
    watchedWarehouseId,
    open && Boolean(watchedWarehouseId),
  );
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = lot ? updateMutation : createMutation;

  useEffect(() => {
    form.reset(lot ? getInventoryLotFormValues(lot) : emptyInventoryLotFormValues);
    resetBackendFormErrors();
  }, [form, lot, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateInventoryLotInput) {
    resetBackendFormErrors();

    try {
      if (lot) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          lot
            ? "inventory.inventory_lot_update_error_fallback"
            : "inventory.inventory_lot_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent size="lg">
        <SheetHeader>
          <SheetTitle>
            {lot
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.inventory_lot"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.inventory_lot"),
                })}
          </SheetTitle>
          <SheetDescription>{t("inventory.inventory_lots.dialog_description")}</SheetDescription>
        </SheetHeader>
        <InventoryLotForm
          form={form}
          formError={formError}
          isEditing={Boolean(lot)}
          isPending={activeMutation.isPending}
          locations={(locationsQuery.data ?? []).map((location) => ({
            id: location.id,
            name: location.name,
          }))}
          onSubmit={handleSubmit}
          products={products}
          submitLabel={
            lot
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.inventory_lot"),
                })
          }
          suppliers={suppliers}
          warehouses={warehouses}
        />
      </SheetContent>
    </Sheet>
  );
}

export { InventoryLotDialog };
