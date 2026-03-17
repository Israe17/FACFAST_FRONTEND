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
  const form = useForm<CreateWarehouseInput>({
    defaultValues: warehouse ? getWarehouseFormValues(warehouse) : emptyWarehouseFormValues,
    resolver: buildFormResolver<CreateWarehouseInput>(createWarehouseSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = warehouse ? updateMutation : createMutation;

  useEffect(() => {
    form.reset(warehouse ? getWarehouseFormValues(warehouse) : emptyWarehouseFormValues);
    resetBackendFormErrors();
  }, [form, open, resetBackendFormErrors, warehouse]);

  async function handleSubmit(values: CreateWarehouseInput) {
    resetBackendFormErrors();

    try {
      if (warehouse) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          warehouse
            ? "inventory.warehouse_update_error_fallback"
            : "inventory.warehouse_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {warehouse
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.warehouse"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.warehouses.dialog_description")}</DialogDescription>
        </DialogHeader>
        <WarehouseForm
          branches={branches}
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            warehouse
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export { WarehouseDialog };
