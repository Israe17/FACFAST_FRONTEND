import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { WarehouseLocation } from "../types";

type GetWarehouseLocationsColumnsParams = {
  canUpdate: boolean;
  onEdit: (location: WarehouseLocation) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

export function getWarehouseLocationsColumns({
  canUpdate,
  onEdit,
  t,
}: GetWarehouseLocationsColumnsParams): ColumnDef<WarehouseLocation>[] {
  const baseColumns: ColumnDef<WarehouseLocation>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.warehouse_location"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">
            {row.original.code
              ? `${t("inventory.common.code")}: ${row.original.code}`
              : t("inventory.common.no_manual_code")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "zone",
      header: t("inventory.form.zone"),
      cell: ({ row }) =>
        [row.original.zone, row.original.aisle, row.original.rack].filter(Boolean).join(" / ") ||
        t("inventory.common.not_available"),
    },
    {
      accessorKey: "position",
      header: t("inventory.form.position"),
      cell: ({ row }) =>
        [row.original.level, row.original.position].filter(Boolean).join(" / ") ||
        t("inventory.common.not_available"),
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
