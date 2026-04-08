"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataCard } from "@/shared/components/data-card";
import { DataTable } from "@/shared/components/data-table";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { APP_ROUTES } from "@/shared/lib/routes";
import { formatDateTime } from "@/shared/lib/utils";

import { useBranchesQuery } from "@/features/branches/queries";

import {
  useInventoryLotsQuery,
  useInventoryMovementsQuery,
  useWarehouseLocationsQuery,
  useWarehouseQuery,
  useWarehouseStockByWarehouseQuery,
} from "../queries";
import type {
  InventoryLot,
  InventoryMovementHeader,
  WarehouseLocation,
  WarehouseStockRow,
} from "../types";
import { useInventoryModule } from "../use-inventory-module";
import { InventoryDetailBlock } from "./inventory-detail-block";
import { InventoryEntityHeader } from "./inventory-entity-header";

type InventoryWarehouseDetailProps = {
  warehouseId: string;
};

function InventoryWarehouseDetail({ warehouseId }: InventoryWarehouseDetailProps) {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canViewWarehouse = can("warehouses.view");
  const warehouseQuery = useWarehouseQuery(warehouseId, canRunTenantQueries && canViewWarehouse);
  const locationsQuery = useWarehouseLocationsQuery(
    warehouseId,
    canRunTenantQueries && can("warehouse_locations.view"),
  );
  const stockQuery = useWarehouseStockByWarehouseQuery(
    warehouseId,
    canRunTenantQueries && can("warehouse_stock.view"),
  );
  const lotsQuery = useInventoryLotsQuery(canRunTenantQueries && can("inventory_lots.view"));
  const movementsQuery = useInventoryMovementsQuery(
    canRunTenantQueries && can("inventory_movements.view"),
  );
  const branchesQuery = useBranchesQuery(canRunTenantQueries && can("branches.view"));

  if (!canViewWarehouse) {
    return (
      <ErrorState
        description={t("inventory.access_denied_description")}
        title={t("inventory.access_denied_title")}
      />
    );
  }

  if (warehouseQuery.isLoading) {
    return <LoadingState description={t("inventory.detail.loading_warehouse")} />;
  }

  if (warehouseQuery.isError || !warehouseQuery.data) {
    return (
      <ErrorState
        description={t("inventory.detail.warehouse_not_found_description")}
        title={t("inventory.detail.warehouse_not_found_title")}
      />
    );
  }

  const warehouse = warehouseQuery.data;
  const locations = locationsQuery.data ?? [];
  const stockRows = stockQuery.data ?? [];
  const lots = (lotsQuery.data ?? []).filter((lot) => lot.warehouse.id === warehouse.id);
  const movements = (movementsQuery.data ?? [])
    .filter((movement) => movement.lines.some((line) => line.warehouse.id === warehouse.id))
    .sort((a, b) => {
      const aDate = a.occurred_at ? new Date(a.occurred_at).getTime() : 0;
      const bDate = b.occurred_at ? new Date(b.occurred_at).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 8);
  const branch = (branchesQuery.data ?? []).find((item) => item.id === warehouse.branch_id);

  const locationColumns: ColumnDef<WarehouseLocation>[] = [
    { accessorKey: "name", header: t("inventory.entity.warehouse_location") },
    { accessorKey: "zone", header: t("inventory.form.zone") },
    { accessorKey: "aisle", header: t("inventory.form.aisle") },
    {
      accessorKey: "is_active",
      header: t("inventory.common.status"),
      cell: ({ row }) => (row.original.is_active ? t("inventory.common.active") : t("inventory.common.inactive")),
    },
  ];

  const stockColumns: ColumnDef<WarehouseStockRow>[] = [
    { accessorKey: "product", header: t("inventory.entity.product"), cell: ({ row }) => row.original.product.name },
    {
      accessorKey: "product_variant",
      header: t("inventory.detail.variant_label"),
      cell: ({ row }) =>
        row.original.product_variant?.variant_name ??
        row.original.product_variant?.sku ??
        t("inventory.detail.default_variant"),
    },
    { accessorKey: "quantity", header: t("inventory.form.on_hand_quantity") },
    { accessorKey: "available_quantity", header: t("inventory.form.available_quantity") },
  ];

  const lotColumns: ColumnDef<InventoryLot>[] = [
    { accessorKey: "lot_number", header: t("inventory.form.lot_number") },
    { accessorKey: "product", header: t("inventory.entity.product"), cell: ({ row }) => row.original.product.name },
    { accessorKey: "current_quantity", header: t("inventory.form.current_quantity") },
    {
      accessorKey: "expiration_date",
      header: t("inventory.form.expiration_date"),
      cell: ({ row }) => row.original.expiration_date ?? t("inventory.common.not_available"),
    },
  ];

  const movementColumns: ColumnDef<InventoryMovementHeader>[] = [
    {
      accessorKey: "code",
      header: t("inventory.entity.inventory_movement"),
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div>
            <span className="font-medium">{m.code ?? m.id}</span>
            {m.status ? (
              <Badge variant={m.status === "posted" ? "default" : "outline"} className="ml-1.5 text-[10px] px-1.5 py-0">
                {t(`inventory.enum.inventory_movement_status.${m.status}` as const)}
              </Badge>
            ) : null}
            {m.notes ? (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{m.notes}</p>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "movement_type",
      header: t("inventory.form.movement_type"),
      cell: ({ row }) => {
        const m = row.original;
        if (m.movement_type) {
          return t(`inventory.enum.ledger_movement_type.${m.movement_type}` as const);
        }
        // Infer type from source_document_type or notes
        if (m.source_document_type) {
          return m.source_document_type;
        }
        if (m.notes?.toLowerCase().includes("devolucion")) {
          return "Devolución";
        }
        return t("inventory.common.not_available");
      },
    },
    {
      accessorKey: "lines",
      header: t("inventory.entity.product"),
      cell: ({ row }) => {
        const warehouseLines = row.original.lines.filter((l) => l.warehouse?.id === warehouse.id);
        const line = warehouseLines[0] ?? row.original.lines[0];
        if (!line) return t("inventory.common.not_available");
        return (
          <div>
            <span>{line.product?.name ?? t("inventory.common.not_available")}</span>
            {warehouseLines.length > 1 ? (
              <span className="text-xs text-muted-foreground ml-1">+{warehouseLines.length - 1}</span>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: t("inventory.form.quantity"),
      cell: ({ row }) => {
        const warehouseLines = row.original.lines.filter((l) => l.warehouse?.id === warehouse.id);
        const total = warehouseLines.reduce((sum, l) => sum + (l.quantity ?? 0), 0);
        return total;
      },
    },
    {
      accessorKey: "occurred_at",
      header: t("inventory.form.occurred_at"),
      cell: ({ row }) => formatDateTime(row.original.occurred_at),
    },
  ];

  return (
    <div className="space-y-6">
      <InventoryEntityHeader
        backHref={APP_ROUTES.inventoryWarehouses}
        backLabel={t("inventory.detail.back_to_warehouses")}
        badges={
          <>
            <Badge variant={warehouse.is_active ? "default" : "outline"}>
              {warehouse.is_active ? t("inventory.common.active") : t("inventory.common.inactive")}
            </Badge>
            {warehouse.is_default ? <Badge>{t("inventory.form.default_warehouse")}</Badge> : null}
            {warehouse.purpose ? (
              <Badge variant="outline">
                {t(`inventory.enum.warehouse_purpose.${warehouse.purpose}` as const)}
              </Badge>
            ) : null}
          </>
        }
        breadcrumbs={[
          { href: APP_ROUTES.inventory, label: t("inventory.page_title") },
          { href: APP_ROUTES.inventoryWarehouses, label: t("inventory.nav.warehouses") },
          { label: warehouse.name },
        ]}
        code={warehouse.code}
        description={t("inventory.detail.warehouse_description")}
        title={warehouse.name}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DataCard
          description={t("inventory.detail.warehouse_kpi_locations")}
          title={t("inventory.entity.warehouse_locations")}
          value={locations.length}
        />
        <DataCard
          description={t("inventory.detail.warehouse_kpi_stock")}
          title={t("inventory.entity.warehouse_stock")}
          value={stockRows.length}
        />
        <DataCard
          description={t("inventory.detail.warehouse_kpi_lots")}
          title={t("inventory.entity.inventory_lots")}
          value={lots.length}
        />
        <DataCard
          description={t("inventory.detail.warehouse_kpi_movements")}
          title={t("inventory.entity.inventory_movements")}
          value={movements.length}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <InventoryDetailBlock
          description={t("inventory.detail.summary_block_description")}
          title={t("inventory.detail.summary_block_title")}
        >
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.form.branch")}</dt>
              <dd className="font-medium">{branch?.name ?? warehouse.branch_id ?? t("inventory.common.not_available")}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.form.purpose")}</dt>
              <dd className="font-medium">
                {warehouse.purpose
                  ? t(`inventory.enum.warehouse_purpose.${warehouse.purpose}` as const)
                  : t("inventory.common.not_available")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.form.uses_locations")}</dt>
              <dd className="font-medium">
                {warehouse.uses_locations ? t("inventory.common.active") : t("inventory.common.inactive")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.common.updated")}</dt>
              <dd className="font-medium">{formatDateTime(warehouse.updated_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.detail.created_at")}</dt>
              <dd className="font-medium">{formatDateTime(warehouse.created_at)}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
            {warehouse.description ?? t("inventory.common.no_description")}
          </div>
        </InventoryDetailBlock>

        <InventoryDetailBlock
          description={t("inventory.detail.branch_block_description")}
          title={t("inventory.detail.branch_block_title")}
        >
          <div className="rounded-2xl border border-border/70 p-4">
            <p className="font-medium">{branch?.name ?? t("inventory.common.not_available")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {branch?.business_name ?? t("inventory.detail.single_branch_scope")}
            </p>
          </div>
        </InventoryDetailBlock>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InventoryDetailBlock
          description={t("inventory.detail.locations_block_description")}
          title={t("inventory.entity.warehouse_locations")}
        >
          <DataTable
            enablePagination={false}
            columns={locationColumns}
            data={locations}
            emptyMessage={t("inventory.detail.no_warehouse_locations")}
          />
        </InventoryDetailBlock>

        <InventoryDetailBlock
          description={t("inventory.detail.stock_block_description")}
          title={t("inventory.entity.warehouse_stock")}
        >
          <DataTable
            enablePagination={false}
            columns={stockColumns}
            data={stockRows}
            emptyMessage={t("inventory.detail.no_stock_rows")}
          />
        </InventoryDetailBlock>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InventoryDetailBlock
          description={t("inventory.detail.lots_block_description")}
          title={t("inventory.entity.inventory_lots")}
        >
          <DataTable
            enablePagination={false}
            columns={lotColumns}
            data={lots}
            emptyMessage={t("inventory.detail.no_related_lots")}
          />
        </InventoryDetailBlock>

        <InventoryDetailBlock
          description={t("inventory.detail.movements_block_description")}
          title={t("inventory.detail.recent_movements_title")}
        >
          <DataTable
            enablePagination={false}
            columns={movementColumns}
            data={movements}
            emptyMessage={t("inventory.detail.no_recent_movements")}
          />
        </InventoryDetailBlock>
      </div>
    </div>
  );
}

export { InventoryWarehouseDetail };
