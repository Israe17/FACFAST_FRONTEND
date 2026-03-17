import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";
import { getInventoryProductRoute } from "@/shared/lib/routes";

import type { Product } from "../types";

export function getProductsColumns({
  canUpdate,
  canView,
  onEdit,
  t,
}: {
  canUpdate: boolean;
  canView: boolean;
  onEdit: (product: Product) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
}): ColumnDef<Product>[] {
  const baseColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.product"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.original.name}</p>
            {row.original.is_active ? null : (
              <Badge variant="outline">{t("inventory.common.inactive")}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {row.original.sku
              ? `SKU: ${row.original.sku}`
              : row.original.code
                ? `${t("inventory.common.code")}: ${row.original.code}`
                : t("inventory.products.no_commercial_reference")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: t("inventory.common.type"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type
            ? t(`inventory.enum.product_type.${row.original.type}` as const)
            : t("inventory.common.not_available")}
        </Badge>
      ),
    },
    {
      accessorKey: "tax_profile",
      header: t("inventory.form.tax_profile"),
      cell: ({ row }) => row.original.tax_profile?.name ?? t("inventory.common.not_available"),
    },
    {
      accessorKey: "track_inventory",
      header: t("inventory.form.inventory"),
      cell: ({ row }) =>
        row.original.type === "service"
          ? t("inventory.products.inventory_service")
          : row.original.track_inventory
            ? row.original.track_expiration
              ? t("inventory.products.inventory_track_lots_expiration")
              : row.original.track_lots
                ? t("inventory.products.inventory_track_lots")
                : t("inventory.products.inventory_track_only")
            : t("inventory.products.inventory_no_stock"),
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
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={getInventoryProductRoute(row.original.id)}>
              <Eye className="size-4" />
              {t("inventory.common.view")}
            </Link>
          </Button>
          {canUpdate ? (
            <Button
              onClick={() => {
                onEdit(row.original);
              }}
              size="sm"
              variant="outline"
            >
              <Pencil className="size-4" />
              {t("inventory.common.edit")}
            </Button>
          ) : null}
        </div>
      ),
    });
  }

  return baseColumns;
}
