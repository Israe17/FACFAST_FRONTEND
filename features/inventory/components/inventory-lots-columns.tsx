import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { InventoryLot } from "../types";

type GetInventoryLotsColumnsParams = {
  canUpdate: boolean;
  onEdit: (lot: InventoryLot) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

export function getInventoryLotsColumns({
  canUpdate,
  onEdit,
  t,
}: GetInventoryLotsColumnsParams): ColumnDef<InventoryLot>[] {
  const baseColumns: ColumnDef<InventoryLot>[] = [
    {
      accessorKey: "lot_number",
      header: t("inventory.entity.inventory_lot"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.lot_number}</p>
          <p className="text-sm text-muted-foreground">
            {row.original.code
              ? `${t("inventory.common.code")}: ${row.original.code}`
              : t("inventory.common.no_manual_code")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "product",
      header: t("inventory.form.product"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.product.name}</p>
          {row.original.product_variant && !row.original.product_variant.is_default ? (
            <p className="text-muted-foreground">
              {row.original.product_variant.variant_name ?? row.original.product_variant.sku}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "warehouse",
      header: t("inventory.entity.warehouse"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.warehouse.name}</p>
          <p className="text-muted-foreground">
            {row.original.location?.name ?? t("inventory.form.no_location")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "current_quantity",
      header: t("inventory.form.current_quantity"),
      cell: ({ row }) => row.original.current_quantity ?? 0,
    },
    {
      accessorKey: "expiration_date",
      header: t("inventory.form.expiration_date"),
      cell: ({ row }) => row.original.expiration_date ?? t("inventory.common.not_available"),
    },
    {
      accessorKey: "updated_at",
      header: t("inventory.common.updated"),
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
  ];

  if (canUpdate) {
    baseColumns.push({
      id: "actions",
      header: t("inventory.common.actions"),
      cell: ({ row }) => (
        <Button
          onClick={() => onEdit(row.original)}
          size="sm"
          variant="outline"
        >
          <Pencil className="size-4" />
          {t("inventory.common.edit")}
        </Button>
      ),
    });
  }

  return baseColumns;
}
