import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { TaxProfile } from "../types";

type GetTaxProfilesColumnsParams = {
  canUpdate: boolean;
  onEdit: (taxProfile: TaxProfile) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

export function getTaxProfilesColumns({
  canUpdate,
  onEdit,
  t,
}: GetTaxProfilesColumnsParams): ColumnDef<TaxProfile>[] {
  const baseColumns: ColumnDef<TaxProfile>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.tax_profile"),
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
      accessorKey: "item_kind",
      header: t("inventory.form.item_kind"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.item_kind
            ? t(`inventory.enum.tax_profile_item_kind.${row.original.item_kind}` as const)
            : t("inventory.common.not_available")}
        </Badge>
      ),
    },
    {
      accessorKey: "tax_type",
      header: t("inventory.form.tax_type"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <Badge variant="outline">
            {row.original.tax_type
              ? t(`inventory.enum.tax_type.${row.original.tax_type}` as const)
              : t("inventory.common.not_available")}
          </Badge>
          {row.original.tax_type === "iva" && row.original.iva_rate !== undefined ? (
            <p className="text-xs text-muted-foreground">IVA {row.original.iva_rate}%</p>
          ) : null}
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
