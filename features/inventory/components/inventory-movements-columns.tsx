import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";
import { getInventoryMovementRoute } from "@/shared/lib/routes";

import type { InventoryMovementRow } from "../types";

type GetInventoryMovementsColumnsParams = {
  canAdjust: boolean;
  canView: boolean;
  onCancel: (movement: InventoryMovementRow) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

export function getInventoryMovementsColumns({
  canAdjust,
  canView,
  onCancel,
  t,
}: GetInventoryMovementsColumnsParams): ColumnDef<InventoryMovementRow>[] {
  const baseColumns: ColumnDef<InventoryMovementRow>[] = [
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
            {row.original.header_id
              ? `${t("inventory.form.header_id")}: ${row.original.header_id}`
              : `${t("inventory.common.code")}: ${row.original.id}`}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "movement_type",
      header: t("inventory.form.movement_type"),
      cell: ({ row }) =>
        row.original.movement_type
          ? t(`inventory.enum.ledger_movement_type.${row.original.movement_type}` as const)
          : t("inventory.common.not_available"),
    },
    {
      accessorKey: "warehouse",
      header: t("inventory.entity.warehouse"),
      cell: ({ row }) => row.original.warehouse.name,
    },
    {
      accessorKey: "product",
      header: t("inventory.form.product"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.product.name}</p>
          <p className="text-muted-foreground">
            {row.original.product_variant?.sku ?? t("inventory.common.not_available")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: t("inventory.form.quantity"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.quantity ?? 0}</p>
          <p className="text-muted-foreground">
            {t("inventory.form.on_hand_delta")}: {row.original.on_hand_delta ?? 0}
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

  if (canAdjust || canView) {
    baseColumns.push({
      id: "actions",
      header: t("inventory.common.actions"),
      cell: ({ row }) => {
        const isPrimaryLine = !row.original.line_no || row.original.line_no === 1;

        if (!isPrimaryLine || !row.original.header_id) {
          return null;
        }

        return (
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={getInventoryMovementRoute(row.original.header_id)}>
                <Eye className="size-4" />
                {t("inventory.common.view")}
              </Link>
            </Button>
            {canAdjust && row.original.status === "posted" ? (
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
