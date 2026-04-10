import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { formatDateTime } from "@/shared/lib/utils";

import type { Zone } from "../types";

type GetZonesColumnsParams = {
  canDelete: boolean;
  canUpdate: boolean;
  onBranches?: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  onEdit: (zone: Zone) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function getZonesColumns({
  canDelete,
  canUpdate,
  onBranches,
  onDelete,
  onEdit,
  t,
}: GetZonesColumnsParams): ColumnDef<Zone>[] {
  const baseColumns: ColumnDef<Zone>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.zone"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <Link href={`/dispatch/zones/${row.original.id}`} className="font-medium hover:underline text-primary">
            {row.original.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {row.original.code
              ? `${t("inventory.common.code")}: ${row.original.code}`
              : t("inventory.common.no_manual_code")}
          </p>
        </div>
      ),
    },
    {
      id: "location",
      header: t("inventory.zones.location"),
      cell: ({ row }) => {
        const parts = [
          row.original.province,
          row.original.canton,
          row.original.district,
        ].filter(Boolean);
        return (
          <span className="text-sm text-muted-foreground">
            {parts.length > 0 ? parts.join(" / ") : t("inventory.common.no_description")}
          </span>
        );
      },
    },
    {
      id: "branches",
      header: t("inventory.branch_assignments.column_header"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.is_global
            ? t("inventory.branch_assignments.global")
            : t("inventory.branch_assignments.branch_count", {
                count: String(row.original.assigned_branch_ids?.length ?? 0),
              })}
        </Badge>
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

  baseColumns.push({
    id: "actions",
    header: t("inventory.common.actions"),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/dispatch/zones/${row.original.id}`}>
            <Eye className="size-4" />
            {t("inventory.common.view")}
          </Link>
        </Button>
        {canUpdate || canDelete ? (
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
            ...(onBranches && canUpdate
              ? [
                  {
                    label: t("inventory.branch_assignments.manage_action"),
                    icon: Building2,
                    onClick: () => onBranches(row.original),
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
        ) : null}
      </div>
    ),
  });

  return baseColumns;
}

export { getZonesColumns };
