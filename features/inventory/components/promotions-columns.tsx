import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { formatDateTime } from "@/shared/lib/utils";

import type { Promotion } from "../types";

export function getPromotionsColumns({
  canUpdate,
  onDelete,
  onEdit,
  t,
}: {
  canUpdate: boolean;
  onDelete: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
}): ColumnDef<Promotion>[] {
  const columns: ColumnDef<Promotion>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.promotion"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.original.name}</p>
            {row.original.is_active ? null : (
              <Badge variant="outline">{t("inventory.common.inactive")}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {row.original.code
              ? `${t("inventory.common.code")}: ${row.original.code}`
              : t("inventory.common.no_manual_code")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: t("inventory.form.promotion_type"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type
            ? t(`inventory.enum.promotion_type.${row.original.type}` as const)
            : t("inventory.common.not_available")}
        </Badge>
      ),
    },
    {
      accessorKey: "items",
      header: t("inventory.promotions.items_count"),
      cell: ({ row }) => row.original.items.length,
    },
    {
      accessorKey: "valid_from",
      header: t("inventory.form.validity"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{formatDateTime(row.original.valid_from)}</p>
          <p className="text-muted-foreground">{formatDateTime(row.original.valid_to)}</p>
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: t("inventory.common.updated"),
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
  ];

  if (canUpdate) {
    columns.push({
      id: "actions",
      header: t("inventory.common.actions"),
      cell: ({ row }) => (
        <TableRowActions
          actions={[
            {
              label: t("inventory.common.edit"),
              icon: Pencil,
              onClick: () => onEdit(row.original),
            },
            {
              label: t("inventory.common.delete"),
              icon: Trash2,
              variant: "destructive",
              onClick: () => onDelete(row.original),
            },
          ]}
        />
      ),
    });
  }

  return columns;
}
