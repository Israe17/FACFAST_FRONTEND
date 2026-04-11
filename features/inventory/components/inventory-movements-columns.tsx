import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";
import { getInventoryMovementRoute } from "@/shared/lib/routes";

import type { InventoryMovementHeader } from "../types";

type GetInventoryMovementsColumnsParams = {
  canCancel: boolean;
  canView: boolean;
  onCancel: (movement: InventoryMovementHeader) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

export function getInventoryMovementsColumns({
  canCancel,
  canView,
  onCancel,
  t,
}: GetInventoryMovementsColumnsParams): ColumnDef<InventoryMovementHeader>[] {
  const baseColumns: ColumnDef<InventoryMovementHeader>[] = [
    {
      accessorKey: "code",
      header: t("inventory.entity.inventory_movement"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.original.code ?? row.original.id}</p>
            {row.original.status ? (
              <Badge variant="outline">
                {t(`inventory.enum.inventory_movement_status.${row.original.status}` as const)}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {row.original.notes ?? t("inventory.common.no_notes")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "movement_type",
      header: t("inventory.form.movement_type"),
      cell: ({ row }) => {
        const isManaged =
          row.original.source_document_type === "SaleOrder" ||
          row.original.source_document_type === "DispatchOrder";
        return (
          <div className="flex items-center gap-2">
            <span>
              {row.original.movement_type
                ? t(`inventory.enum.ledger_movement_type.${row.original.movement_type}` as const)
                : t("inventory.common.not_available")}
            </span>
            {isManaged ? (
              <Badge variant="secondary" className="text-xs">
                {t("inventory.inventory_movements.managed_badge")}
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "branch",
      header: t("inventory.form.branch"),
      cell: ({ row }) =>
        row.original.branch?.name ??
        row.original.branch?.business_name ??
        t("inventory.common.not_available"),
    },
    {
      accessorKey: "line_count",
      header: t("inventory.detail.line_items"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.line_count ?? row.original.lines.length}</p>
          <p className="text-muted-foreground">{row.original.lines[0]?.warehouse.name ?? t("inventory.common.not_available")}</p>
        </div>
      ),
    },
    {
      accessorKey: "lines",
      header: t("inventory.form.product"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.lines[0]?.product.name ?? t("inventory.common.not_available")}</p>
          <p className="text-muted-foreground">
            {row.original.lines[0]?.product_variant?.variant_name ??
              row.original.lines[0]?.product_variant?.sku ??
              t("inventory.detail.default_variant")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "occurred_at",
      header: t("inventory.form.occurred_at"),
      cell: ({ row }) => <span>{formatDateTime(row.original.occurred_at)}</span>,
    },
  ];

  if (canCancel || canView) {
    baseColumns.push({
      id: "actions",
      header: t("inventory.common.actions"),
      cell: ({ row }) => {
        return (
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={getInventoryMovementRoute(row.original.id)}>
                <Eye className="size-4" />
                {t("inventory.common.view")}
              </Link>
            </Button>
            {canCancel &&
            row.original.status === "posted" &&
            row.original.source_document_type !== "SaleOrder" &&
            row.original.source_document_type !== "DispatchOrder" ? (
              <Button
                onClick={() => onCancel(row.original)}
                size="sm"
                variant="outline"
              >
                <Ban className="size-4" />
                {t("inventory.inventory_movements.cancel_action")}
              </Button>
            ) : null}
          </div>
        );
      },
    });
  }

  return baseColumns;
}
