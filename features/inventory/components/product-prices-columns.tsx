import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { formatDateTime } from "@/shared/lib/utils";

import type { ProductPrice } from "../types";

function formatPrice(value: number | undefined, currency = "CRC") {
  if (value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("es-CR", {
    currency,
    maximumFractionDigits: 4,
    style: "currency",
  }).format(value);
}

type GetProductPricesColumnsParams = {
  canDelete: boolean;
  canUpdate: boolean;
  onDelete: (productPrice: ProductPrice) => void;
  onEdit: (productPrice: ProductPrice) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

export function getProductPricesColumns({
  canDelete,
  canUpdate,
  onDelete,
  onEdit,
  t,
}: GetProductPricesColumnsParams): ColumnDef<ProductPrice>[] {
  const baseColumns: ColumnDef<ProductPrice>[] = [
    {
      accessorKey: "price_list",
      header: t("inventory.entity.price_list"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">
            {row.original.price_list?.name ?? t("inventory.common.not_available")}
          </p>
          <Badge variant="outline">
            {row.original.price_list?.kind
              ? t(`inventory.enum.price_list_kind.${row.original.price_list.kind}` as const)
              : t("inventory.common.not_available")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "product_variant",
      header: t("inventory.common.coverage"),
      cell: ({ row }) =>
        row.original.product_variant && !row.original.product_variant.is_default
          ? row.original.product_variant.variant_name ?? row.original.product_variant.sku
          : t("inventory.common.all_variants"),
    },
    {
      accessorKey: "price",
      header: t("inventory.form.price"),
      cell: ({ row }) =>
        formatPrice(row.original.price, row.original.price_list?.currency ?? "CRC"),
    },
    {
      accessorKey: "min_quantity",
      header: t("inventory.form.min_quantity"),
      cell: ({ row }) => row.original.min_quantity ?? t("inventory.common.not_available"),
    },
    {
      accessorKey: "valid_from",
      header: t("inventory.form.validity"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.valid_from ? formatDateTime(row.original.valid_from) : "-"}</p>
          <p className="text-muted-foreground">
            {row.original.valid_to ? formatDateTime(row.original.valid_to) : "-"}
          </p>
        </div>
      ),
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
