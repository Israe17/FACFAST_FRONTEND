import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Power } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { formatDateTime } from "@/shared/lib/utils";
import { getInventoryWarehouseRoute } from "@/shared/lib/routes";

import type { Warehouse } from "../types";

type GetWarehousesColumnsParams = {
  branchNameById: Map<string, string>;
  canUpdate: boolean;
  canView: boolean;
  onDeactivate: (warehouse: Warehouse) => void;
  onEdit: (warehouse: Warehouse) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function getWarehousesColumns({
  branchNameById,
  canUpdate,
  canView,
  onDeactivate,
  onEdit,
  t,
}: GetWarehousesColumnsParams): ColumnDef<Warehouse>[] {
  const baseColumns: ColumnDef<Warehouse>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.warehouse"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.original.name}</p>
            {row.original.is_default ? <Badge>{t("inventory.form.default_warehouse")}</Badge> : null}
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
      accessorKey: "branch_id",
      header: t("inventory.form.branch"),
      cell: ({ row }) =>
        branchNameById.get(row.original.branch_id ?? "") ??
        row.original.branch_id ??
        t("inventory.common.not_available"),
    },
    {
      accessorKey: "purpose",
      header: t("inventory.form.purpose"),
      cell: ({ row }) =>
        row.original.purpose
          ? t(`inventory.enum.warehouse_purpose.${row.original.purpose}` as const)
          : t("inventory.common.not_available"),
    },
    {
      accessorKey: "uses_locations",
      header: t("inventory.form.locations"),
      cell: ({ row }) =>
        row.original.uses_locations
          ? t("inventory.common.active")
          : t("inventory.common.inactive"),
    },
    {
      accessorKey: "updated_at",
      header: t("inventory.common.updated"),
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
  ];

  if (canUpdate || canView) {
    baseColumns.push({
      id: "actions",
      header: t("inventory.common.actions"),
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={getInventoryWarehouseRoute(row.original.id)}>
              <Eye className="size-4" />
              {t("inventory.common.view")}
            </Link>
          </Button>
          {canUpdate ? (
            <TableRowActions
              actions={[
                {
                  label: t("inventory.common.edit"),
                  icon: Pencil,
                  onClick: () => onEdit(row.original),
                },
                ...(row.original.is_active
                  ? [
                      {
                        label: t("inventory.common.deactivate"),
                        icon: Power,
                        variant: "destructive" as const,
                        onClick: () => onDeactivate(row.original),
                      },
                    ]
                  : []),
              ]}
            />
          ) : null}
        </div>
      ),
    });
  }

  return baseColumns;
}

export { getWarehousesColumns };
