"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataTable } from "@/shared/components/data-table";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { formatDateTime } from "@/shared/lib/utils";

import { ledgerMovementTypeTranslationMap } from "../constants";
import { useInventoryMovementsByVariantQuery } from "../queries";
import type { InventoryMovementHeader } from "../types";

export type ProductMovementsTarget = {
  warehouseId: string;
  warehouseName: string;
  variantId: string;
  productName: string;
};

export type ProductMovementsSheetProps = {
  onOpenChange: (open: boolean) => void;
  target: ProductMovementsTarget | null;
};

function deltaForVariantInWarehouse(
  movement: InventoryMovementHeader,
  variantId: string,
  warehouseId: string,
): number {
  const matching = (movement.lines ?? []).filter(
    (line) =>
      String(line.warehouse?.id ?? "") === warehouseId &&
      String(line.product_variant?.id ?? "") === variantId,
  );
  return matching.reduce(
    (sum, line) => sum + Number(line.on_hand_delta ?? 0),
    0,
  );
}

export function ProductMovementsSheet({
  onOpenChange,
  target,
}: ProductMovementsSheetProps) {
  const { t } = useAppTranslator();
  const open = target !== null;
  const movementsQuery = useInventoryMovementsByVariantQuery(
    {
      warehouseId: target?.warehouseId ?? "",
      variantId: target?.variantId ?? "",
    },
    open,
  );

  const columns = useMemo<ColumnDef<InventoryMovementHeader>[]>(
    () => [
      {
        accessorKey: "occurred_at",
        header: t("inventory.form.occurred_at"),
        cell: ({ row }) =>
          row.original.occurred_at ? formatDateTime(row.original.occurred_at) : "",
      },
      {
        accessorKey: "movement_type",
        header: t("inventory.form.movement_type"),
        cell: ({ row }) => {
          const type = row.original.movement_type;
          const labelKey = type
            ? ledgerMovementTypeTranslationMap[type] ?? "inventory.common.not_available"
            : "inventory.common.not_available";
          return <Badge variant="outline">{t(labelKey)}</Badge>;
        },
      },
      {
        id: "delta",
        header: t("inventory.form.on_hand_quantity"),
        cell: ({ row }) => {
          if (!target) return null;
          const delta = deltaForVariantInWarehouse(
            row.original,
            target.variantId,
            target.warehouseId,
          );
          if (delta === 0) {
            return <span className="text-muted-foreground">0</span>;
          }
          return (
            <span
              className={
                delta > 0
                  ? "font-medium text-emerald-600"
                  : "font-medium text-red-600"
              }
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          );
        },
      },
      {
        accessorKey: "code",
        header: t("inventory.form.code"),
        cell: ({ row }) => row.original.code ?? "",
      },
      {
        accessorKey: "performed_by",
        header: t("inventory.detail.performed_by"),
        cell: ({ row }) => row.original.performed_by?.name ?? "",
      },
    ],
    [t, target],
  );

  return (
    <Sheet
      onOpenChange={(value) => {
        if (!value) {
          onOpenChange(false);
        }
      }}
      open={open}
    >
      <SheetContent size="md">
        <SheetHeader>
          <SheetTitle>
            {t("inventory.warehouse_detail.product_movements_title", {
              warehouse: target?.warehouseName ?? "",
            })}
          </SheetTitle>
          <SheetDescription>
            {t("inventory.warehouse_detail.product_movements_description", {
              product: target?.productName ?? "",
            })}
          </SheetDescription>
        </SheetHeader>

        {movementsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.inventory_movements"),
            })}
          />
        ) : null}

        {movementsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              movementsQuery.error,
              t("inventory.movements_load_error_fallback"),
            )}
            onRetry={() => movementsQuery.refetch()}
          />
        ) : null}

        {!movementsQuery.isLoading && !movementsQuery.isError ? (
          <DataTable
            enablePagination={false}
            columns={columns}
            data={movementsQuery.data ?? []}
            emptyMessage={t(
              "inventory.warehouse_detail.no_movements_for_product",
            )}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
