"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/shared/components/data-table";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { formatDateTime } from "@/shared/lib/utils";

import {
  useWarehousesQuery,
  useWarehouseStockByWarehouseQuery,
  useWarehouseStockQuery,
} from "../queries";
import type { WarehouseStockRow } from "../types";
import { productTypeTranslationMap } from "../constants";
import { CatalogSectionCard } from "./catalog-section-card";
import { WarehouseStockThresholdsDialog } from "./warehouse-stock-thresholds-dialog";

const ALL_WAREHOUSES_VALUE = "__all__";

function isBelowMin(row: WarehouseStockRow): boolean {
  if (row.min_stock == null) {
    return false;
  }
  return Number(row.available_quantity ?? 0) < Number(row.min_stock);
}

function formatThreshold(value: number | null | undefined, fallback: string): string {
  if (value == null) {
    return fallback;
  }
  return Number(value).toString();
}

type WarehouseStockSectionProps = {
  enabled?: boolean;
};

function WarehouseStockSection({ enabled = true }: WarehouseStockSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("warehouse_stock.view");
  const canViewWarehouses = can("warehouses.view");
  const canUpdateWarehouses = can("warehouses.update");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(ALL_WAREHOUSES_VALUE);
  const [onlyBelowMin, setOnlyBelowMin] = useState(false);
  const [thresholdsTarget, setThresholdsTarget] = useState<WarehouseStockRow | null>(null);
  const warehousesQuery = useWarehousesQuery(enabled && canViewWarehouses);
  const resolvedSelectedWarehouseId =
    selectedWarehouseId === ALL_WAREHOUSES_VALUE ||
    (warehousesQuery.data ?? []).some((warehouse) => warehouse.id === selectedWarehouseId)
      ? selectedWarehouseId
      : ALL_WAREHOUSES_VALUE;
  const stockQuery = useWarehouseStockQuery(
    enabled && canView && resolvedSelectedWarehouseId === ALL_WAREHOUSES_VALUE,
  );
  const warehouseScopedStockQuery = useWarehouseStockByWarehouseQuery(
    resolvedSelectedWarehouseId,
    enabled && canView && resolvedSelectedWarehouseId !== ALL_WAREHOUSES_VALUE,
  );
  const activeStockQuery =
    resolvedSelectedWarehouseId === ALL_WAREHOUSES_VALUE ? stockQuery : warehouseScopedStockQuery;

  const placeholder = t("inventory.warehouse_stock.threshold_value_placeholder");

  const filteredData = useMemo(() => {
    const rows = activeStockQuery.data ?? [];
    return onlyBelowMin ? rows.filter(isBelowMin) : rows;
  }, [activeStockQuery.data, onlyBelowMin]);

  const columns = useMemo<ColumnDef<WarehouseStockRow>[]>(
    () => [
      {
        accessorKey: "product",
        header: t("inventory.entity.product"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{row.original.product.name}</p>
              {row.original.product.type ? (
                <Badge variant="outline">
                  {t(productTypeTranslationMap[row.original.product.type] ?? "inventory.common.not_available")}
                </Badge>
              ) : null}
              {isBelowMin(row.original) ? (
                <Badge variant="destructive">
                  {t("inventory.warehouse_stock.below_min_badge")}
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {row.original.product_variant?.variant_name ??
                row.original.product_variant?.sku ??
                t("inventory.detail.default_variant")}
              {row.original.product_variant?.sku
                ? ` - SKU ${row.original.product_variant.sku}`
                : ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "warehouse",
        header: t("inventory.entity.warehouse"),
        cell: ({ row }) => row.original.warehouse.name,
      },
      {
        accessorKey: "quantity",
        header: t("inventory.form.on_hand_quantity"),
        cell: ({ row }) => row.original.quantity ?? 0,
      },
      {
        accessorKey: "reserved_quantity",
        header: t("inventory.form.reserved_quantity"),
        cell: ({ row }) => row.original.reserved_quantity ?? 0,
      },
      {
        accessorKey: "available_quantity",
        header: t("inventory.form.available_quantity"),
        cell: ({ row }) => row.original.available_quantity ?? 0,
      },
      {
        accessorKey: "projected_quantity",
        header: t("inventory.form.projected_quantity"),
        cell: ({ row }) => row.original.projected_quantity ?? 0,
      },
      {
        accessorKey: "min_stock",
        header: t("inventory.warehouse_stock.min_stock_column"),
        cell: ({ row }) => formatThreshold(row.original.min_stock, placeholder),
      },
      {
        accessorKey: "max_stock",
        header: t("inventory.warehouse_stock.max_stock_column"),
        cell: ({ row }) => formatThreshold(row.original.max_stock, placeholder),
      },
      {
        accessorKey: "updated_at",
        header: t("inventory.common.updated"),
        cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
      },
      ...(canUpdateWarehouses
        ? [
            {
              id: "actions",
              header: "",
              cell: ({ row }) => (
                <TableRowActions
                  actions={[
                    {
                      icon: Pencil,
                      label: t("inventory.warehouse_stock.edit_thresholds_action"),
                      onClick: () => setThresholdsTarget(row.original),
                    },
                  ]}
                />
              ),
            } as ColumnDef<WarehouseStockRow>,
          ]
        : []),
    ],
    [canUpdateWarehouses, placeholder, t],
  );

  if (!canView) {
    return null;
  }

  return (
    <CatalogSectionCard
      description={t("inventory.warehouse_stock.section_description")}
      title={t("inventory.entity.warehouse_stock")}
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="max-w-md flex-1 space-y-2">
          <Label htmlFor="warehouse-stock-filter">{t("inventory.entity.warehouse")}</Label>
          <Select onValueChange={setSelectedWarehouseId} value={resolvedSelectedWarehouseId}>
            <SelectTrigger id="warehouse-stock-filter">
              <SelectValue placeholder={t("inventory.form.select_warehouse")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_WAREHOUSES_VALUE}>
                {t("inventory.form.all_warehouses")}
              </SelectItem>
              {(warehousesQuery.data ?? []).map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={onlyBelowMin}
            onCheckedChange={(checked) => setOnlyBelowMin(checked === true)}
          />
          {t("inventory.warehouse_stock.only_below_min_filter")}
        </label>
      </div>

      {activeStockQuery.isLoading ? (
        <LoadingState
          description={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.warehouse_stock"),
          })}
        />
      ) : null}
      {activeStockQuery.isError ? (
        <ErrorState
          description={getBackendErrorMessage(
            activeStockQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.warehouse_stock"),
            }),
          )}
          onRetry={() => activeStockQuery.refetch()}
        />
      ) : null}
      {!activeStockQuery.isLoading && !activeStockQuery.isError ? (
        <DataTable
          columns={columns}
          data={filteredData}
          emptyMessage={t("inventory.common.empty_entity", {
            entity: t("inventory.entity.warehouse_stock"),
          })}
        />
      ) : null}

      <WarehouseStockThresholdsDialog
        onOpenChange={(open) => {
          if (!open) {
            setThresholdsTarget(null);
          }
        }}
        open={thresholdsTarget !== null}
        row={thresholdsTarget}
      />
    </CatalogSectionCard>
  );
}

export { WarehouseStockSection };
