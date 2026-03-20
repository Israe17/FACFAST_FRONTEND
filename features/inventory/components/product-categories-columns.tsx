import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { formatDateTime } from "@/shared/lib/utils";

import type { ProductCategory } from "../types";

type GetProductCategoriesColumnsParams = {
  canDelete: boolean;
  canUpdate: boolean;
  onDelete: (category: ProductCategory) => void;
  onEdit: (category: ProductCategory) => void;
  parentNameById: Map<string, string>;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function getProductCategoriesColumns({
  canDelete,
  canUpdate,
  onDelete,
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

  if (canUpdate || canDelete) {
    baseColumns.push({
      id: "actions",
      header: t("inventory.common.actions"),
      cell: ({ row }) => (
        <TableRowActions
          actions={[
            ...(canUpdate
              ? [
                  {
                    label: t("inventory.common.edit"),
                    icon: Pencil,
                    onClick: () => onEdit(row.original),
                  },
                ]
              : []),
            ...(canDelete && row.original.lifecycle.can_delete
              ? [
                  {
                    label: t("inventory.common.delete"),
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: () => onDelete(row.original),
                  },
                ]
              : []),
          ]}
        />
      ),
    });
  }

  return baseColumns;
}

export { getProductCategoriesColumns };
