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

import type { Branch } from "@/features/branches/types";

import { emptyWarehouseFormValues, getWarehouseFormValues } from "../form-values";
import {
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
} from "../queries";
import { createWarehouseSchema } from "../schemas";
import type { CreateWarehouseInput, Warehouse } from "../types";
import { WarehouseForm } from "./warehouse-form";

type WarehouseDialogProps = {
  branches: Branch[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  warehouse?: Warehouse | null;
};

function WarehouseDialog({ branches, onOpenChange, open, warehouse }: WarehouseDialogProps) {
  const createMutation = useCreateWarehouseMutation({ showErrorToast: false });
  const updateMutation = useUpdateWarehouseMutation(warehouse?.id ?? "", {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateWarehouseInput, Warehouse>({
    open,
    onOpenChange,
    schema: createWarehouseSchema,
    defaultValues: emptyWarehouseFormValues,
    entity: warehouse,
    mapEntityToForm: getWarehouseFormValues,
    mutation: warehouse ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      warehouse
        ? "inventory.warehouse_update_error_fallback"
        : "inventory.warehouse_create_error_fallback",
    ),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {warehouse
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.warehouse"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse"),
                })}
          </SheetTitle>
          <SheetDescription>{t("inventory.warehouses.dialog_description")}</SheetDescription>
        </SheetHeader>
        <WarehouseForm
          branches={branches}
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitLabel={
            warehouse
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse"),
                })
          }
        />
      </SheetContent>
    </Sheet>
  );
}

export { WarehouseDialog };
