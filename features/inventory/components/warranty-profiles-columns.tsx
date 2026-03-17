import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { WarrantyProfile } from "../types";

type GetWarrantyProfilesColumnsParams = {
  canUpdate: boolean;
  onEdit: (warrantyProfile: WarrantyProfile) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function getWarrantyProfilesColumns({
  canUpdate,
  onEdit,
  t,
}: GetWarrantyProfilesColumnsParams): ColumnDef<WarrantyProfile>[] {
  const baseColumns: ColumnDef<WarrantyProfile>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.warranty_profile"),
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
      accessorKey: "duration_value",
      header: t("inventory.common.coverage"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.duration_value ?? 0}{" "}
          {row.original.duration_unit
            ? t(`inventory.enum.warranty_duration_unit.${row.original.duration_unit}` as const)
            : t("inventory.enum.warranty_duration_unit.months")}
        </Badge>
      ),
    },
    {
      accessorKey: "coverage_notes",
      header: t("inventory.common.notes"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.coverage_notes ?? t("inventory.common.no_notes")}
        </span>
      ),
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

export { getWarrantyProfilesColumns };
