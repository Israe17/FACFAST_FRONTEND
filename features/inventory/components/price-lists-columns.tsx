import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Power, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { formatDateTime } from "@/shared/lib/utils";
import { getInventoryPriceListRoute } from "@/shared/lib/routes";

import type { PriceList } from "../types";

type GetPriceListsColumnsParams = {
  canDelete: boolean;
  canUpdate: boolean;
  canView: boolean;
  onDelete: (priceList: PriceList) => void;
  onDeactivate: (priceList: PriceList) => void;
  onEdit: (priceList: PriceList) => void;
  onReactivate: (priceList: PriceList) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function getPriceListsColumns({
  canDelete,
  canUpdate,
  canView,
  onDelete,
  onDeactivate,
  onEdit,
  onReactivate,
  t,
}: GetPriceListsColumnsParams): ColumnDef<PriceList>[] {
  const baseColumns: ColumnDef<PriceList>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.price_list"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.original.name}</p>
            {row.original.is_default ? <Badge>{t("inventory.form.default_price_list")}</Badge> : null}
            {!row.original.is_active ? (
              <Badge variant="outline">{t("inventory.common.inactive")}</Badge>
            ) : null}
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
      accessorKey: "kind",
      header: t("inventory.common.kind"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.kind
            ? t(`inventory.enum.price_list_kind.${row.original.kind}` as const)
            : t("inventory.common.not_available")}
        </Badge>
      ),
    },
    {
      accessorKey: "currency",
      header: t("inventory.common.currency"),
      cell: ({ row }) => row.original.currency,
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
            <Link href={getInventoryPriceListRoute(row.original.id)}>
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
                ...(canUpdate && row.original.lifecycle.can_deactivate
                  ? [
                      {
                        label: t("inventory.common.deactivate"),
                        icon: Power,
                        variant: "destructive" as const,
                        onClick: () => onDeactivate(row.original),
                      },
                    ]
                  : []),
                ...(canUpdate && row.original.lifecycle.can_reactivate
                  ? [
                      {
                        label: t("inventory.common.reactivate"),
                        icon: RotateCcw,
                        onClick: () => onReactivate(row.original),
                      },
                    ]
                  : []),
                ...(canDelete &&
                !row.original.is_default &&
                row.original.lifecycle.can_delete
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
  }

  return baseColumns;
}

export { getPriceListsColumns };
