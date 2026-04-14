"use client";

import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useProductSerialsQuery } from "@/features/inventory/queries";
import type { Product } from "@/features/inventory/types";

import type { CreateSaleOrderInput } from "../types";

type SaleOrderLineSerialSelectorProps = {
  form: UseFormReturn<CreateSaleOrderInput>;
  lineIndex: number;
  product: Product;
  variantId: string;
  warehouseId: string | undefined;
};

function SaleOrderLineSerialSelector({
  form,
  lineIndex,
  product,
  variantId,
  warehouseId,
}: SaleOrderLineSerialSelectorProps) {
  const { t } = useAppTranslator();

  const serialsQuery = useProductSerialsQuery(
    String(product.id),
    variantId,
    { status: "available", warehouse_id: warehouseId },
    Boolean(warehouseId) && Boolean(variantId),
  );

  const availableSerials = useMemo(
    () => serialsQuery.data ?? [],
    [serialsQuery.data],
  );

  if (!warehouseId) {
    return (
      <p className="text-xs text-muted-foreground">
        {t("sales.form.select_warehouse_for_serials")}
      </p>
    );
  }

  if (serialsQuery.isLoading) {
    return <p className="text-xs text-muted-foreground">...</p>;
  }

  if (availableSerials.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {t("sales.form.no_serials_available")}
      </p>
    );
  }

  return (
    <Controller
      control={form.control}
      name={`lines.${lineIndex}.serial_ids`}
      render={({ field }) => {
        const selectedIds = new Set<number>(
          (field.value ?? []).map(Number),
        );
        return (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {availableSerials.map((serial) => (
              <label
                key={serial.id}
                className="flex items-center gap-2 text-xs"
              >
                <Checkbox
                  checked={selectedIds.has(Number(serial.id))}
                  onCheckedChange={(checked) => {
                    const numId = Number(serial.id);
                    const next = checked
                      ? [...(field.value ?? []), numId]
                      : (field.value ?? []).filter(
                          (id: number) => id !== numId,
                        );
                    field.onChange(next);
                    form.setValue(
                      `lines.${lineIndex}.quantity`,
                      next.length || 1,
                      { shouldDirty: true },
                    );
                  }}
                />
                <span className="font-mono">{serial.serial_number}</span>
              </label>
            ))}
          </div>
        );
      }}
    />
  );
}

export { SaleOrderLineSerialSelector };
