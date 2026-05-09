"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { WarehouseStockRow } from "../types";

type CategoryGroup = {
  key: string;
  name: string;
  rows: WarehouseStockRow[];
  units: number;
};

function groupByCategory(
  rows: WarehouseStockRow[],
  noCategoryLabel: string,
): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();

  for (const row of rows) {
    const category = row.product.category ?? null;
    const key = category ? String(category.id) : "__no_category__";
    const name = category?.name ?? noCategoryLabel;
    const existing = groups.get(key);
    const units = Number(row.quantity ?? 0);
    if (existing) {
      existing.rows.push(row);
      existing.units += units;
    } else {
      groups.set(key, { key, name, rows: [row], units });
    }
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.key === "__no_category__") return 1;
    if (b.key === "__no_category__") return -1;
    return a.name.localeCompare(b.name);
  });
}

export type WarehouseStockByCategoryProps = {
  rows: WarehouseStockRow[];
  emptyMessage: string;
  onSelectRow?: (row: WarehouseStockRow) => void;
};

export function WarehouseStockByCategory({
  rows,
  emptyMessage,
  onSelectRow,
}: WarehouseStockByCategoryProps) {
  const { t } = useAppTranslator();
  const noCategoryLabel = t("inventory.warehouse_detail.no_category_group");
  const groups = useMemo(
    () => groupByCategory(rows, noCategoryLabel),
    [rows, noCategoryLabel],
  );

  const columns = useMemo<ColumnDef<WarehouseStockRow>[]>(
    () => [
      {
        accessorKey: "product",
        header: t("inventory.entity.product"),
        cell: ({ row }) => row.original.product.name,
      },
      {
        accessorKey: "product_variant",
        header: t("inventory.detail.variant_label"),
        cell: ({ row }) =>
          row.original.product_variant?.variant_name ??
          row.original.product_variant?.sku ??
          t("inventory.detail.default_variant"),
      },
      { accessorKey: "quantity", header: t("inventory.form.on_hand_quantity") },
      {
        accessorKey: "available_quantity",
        header: t("inventory.form.available_quantity"),
      },
      ...(onSelectRow
        ? [
            {
              id: "movements",
              header: "",
              cell: ({ row }) => (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSelectRow(row.original)}
                >
                  <History className="size-4" />
                  {t("inventory.warehouse_detail.view_product_movements_action")}
                </Button>
              ),
            } as ColumnDef<WarehouseStockRow>,
          ]
        : []),
    ],
    [onSelectRow, t],
  );

  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key} className="rounded-xl border border-border/70">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-muted/30 px-4 py-2">
            <h4 className="font-medium">{group.name}</h4>
            <Badge variant="outline">
              {t("inventory.warehouse_detail.group_subtotal", {
                skus: group.rows.length,
                units: group.units,
              })}
            </Badge>
          </div>
          <DataTable
            enablePagination={false}
            columns={columns}
            data={group.rows}
            emptyMessage={emptyMessage}
          />
        </div>
      ))}
    </div>
  );
}
