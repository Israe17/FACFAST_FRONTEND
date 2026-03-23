import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { formatDateTime } from "@/shared/lib/utils";

import type { Route } from "../types";

type GetRoutesColumnsParams = {
  canDelete: boolean;
  canUpdate: boolean;
  onDelete: (route: Route) => void;
  onEdit: (route: Route) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function getRoutesColumns({
  canDelete,
  canUpdate,
  onDelete,
  onEdit,
  t,
}: GetRoutesColumnsParams): ColumnDef<Route>[] {
  const baseColumns: ColumnDef<Route>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.route"),
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
      id: "zone",
      header: t("inventory.routes.zone"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.zone?.name ?? "-"}
        </span>
      ),
    },
    {
      id: "default_vehicle",
      header: t("inventory.routes.default_vehicle"),
      cell: ({ row }) => {
        const vehicle = row.original.default_vehicle;
        if (!vehicle) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <div className="space-y-1">
            <p className="text-sm">{vehicle.name}</p>
            <p className="text-sm text-muted-foreground">{vehicle.plate_number}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "frequency",
      header: t("inventory.routes.frequency"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.frequency ?? "-"}
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

export { getRoutesColumns };
