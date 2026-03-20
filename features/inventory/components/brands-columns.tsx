import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { formatDateTime } from "@/shared/lib/utils";

import type { Brand } from "../types";

type GetBrandsColumnsParams = {
  canDelete: boolean;
  canUpdate: boolean;
  onDelete: (brand: Brand) => void;
  onEdit: (brand: Brand) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function getBrandsColumns({
  canDelete,
  canUpdate,
  onDelete,
  onEdit,
  t,
}: GetBrandsColumnsParams): ColumnDef<Brand>[] {
  const baseColumns: ColumnDef<Brand>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.brand"),
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
      accessorKey: "description",
      header: t("inventory.common.description"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description ?? t("inventory.common.no_description")}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: t("inventory.common.status"),
      cell: ({ row }) =>
        row.original.is_active ? t("inventory.common.active") : t("inventory.common.inactive"),
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

export { getBrandsColumns };
