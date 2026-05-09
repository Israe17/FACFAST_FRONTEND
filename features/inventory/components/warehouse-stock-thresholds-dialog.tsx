"use client";

import { useMemo } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";

import { useUpdateWarehouseStockThresholdsMutation } from "../queries";
import { updateWarehouseStockThresholdsSchema } from "../schemas";
import type {
  UpdateWarehouseStockThresholdsInput,
  WarehouseStockRow,
} from "../types";
import { WarehouseStockThresholdsForm } from "./warehouse-stock-thresholds-form";

type WarehouseStockThresholdsDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  row: WarehouseStockRow | null;
};

const emptyValues: UpdateWarehouseStockThresholdsInput = {
  min_stock: undefined,
  max_stock: undefined,
};

function mapRowToForm(row: WarehouseStockRow): UpdateWarehouseStockThresholdsInput {
  return {
    min_stock: row.min_stock ?? undefined,
    max_stock: row.max_stock ?? undefined,
  };
}

function WarehouseStockThresholdsDialog({
  onOpenChange,
  open,
  row,
}: WarehouseStockThresholdsDialogProps) {
  const { t } = useAppTranslator();
  const warehouseId = row?.warehouse?.id ?? "";
  const variantId = row?.product_variant?.id ?? "";
  const mutation = useUpdateWarehouseStockThresholdsMutation({
    showErrorToast: false,
  });

  const adaptedMutation = useMemo(
    () => ({
      mutateAsync: (payload: UpdateWarehouseStockThresholdsInput) =>
        mutation.mutateAsync({ warehouseId, variantId, payload }),
      isPending: mutation.isPending,
    }),
    [mutation, warehouseId, variantId],
  );

  const { form, formError, handleSubmit, isPending } = useDialogForm<
    UpdateWarehouseStockThresholdsInput,
    WarehouseStockRow
  >({
    open,
    onOpenChange,
    schema: updateWarehouseStockThresholdsSchema,
    defaultValues: emptyValues,
    entity: row,
    mapEntityToForm: mapRowToForm,
    mutation: adaptedMutation,
    fallbackErrorMessage: t("inventory.warehouse_stock_update_error_fallback"),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent size="sm">
        <SheetHeader>
          <SheetTitle>{t("inventory.warehouse_stock.threshold_dialog_title")}</SheetTitle>
          <SheetDescription>
            {t("inventory.warehouse_stock.threshold_dialog_description", {
              warehouse: row?.warehouse?.name ?? "",
              product: row?.product?.name ?? "",
            })}
          </SheetDescription>
        </SheetHeader>
        <WarehouseStockThresholdsForm
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitLabel={t("inventory.common.save_changes")}
        />
      </SheetContent>
    </Sheet>
  );
}

export { WarehouseStockThresholdsDialog };
export type { WarehouseStockThresholdsDialogProps };
