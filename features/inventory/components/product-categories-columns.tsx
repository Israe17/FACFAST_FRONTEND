import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { ProductCategory } from "../types";

type GetProductCategoriesColumnsParams = {
  canUpdate: boolean;
  onEdit: (category: ProductCategory) => void;
  parentNameById: Map<string, string>;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function getProductCategoriesColumns({
  canUpdate,
  onEdit,
  parentNameById,
  t,
}: GetProductCategoriesColumnsParams): ColumnDef<ProductCategory>[] {
  const baseColumns: ColumnDef<ProductCategory>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.category"),
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
      accessorKey: "parent_id",
      header: t("inventory.common.parent"),
      cell: ({ row }) =>
        row.original.parent_id
          ? parentNameById.get(row.original.parent_id) ?? t("inventory.common.unknown")
          : t("inventory.common.root"),
    },
    {
      accessorKey: "level",
      header: t("inventory.common.level"),
      cell: ({ row }) => row.original.level ?? 0,
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

export { getProductCategoriesColumns };
