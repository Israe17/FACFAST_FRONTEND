"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataCard } from "@/shared/components/data-card";
import { DataTable } from "@/shared/components/data-table";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import {
  APP_ROUTES,
  getInventoryMovementRoute,
  getInventoryWarehouseRoute,
} from "@/shared/lib/routes";
import { formatDateTime } from "@/shared/lib/utils";

import {
  useInventoryLotsQuery,
  useInventoryMovementsQuery,
  useProductPricesQuery,
  useProductQuery,
  usePromotionsQuery,
  useWarehouseStockQuery,
} from "../queries";
import type {
  InventoryLot,
  InventoryMovementHeader,
  ProductPrice,
  Promotion,
  WarehouseStockRow,
} from "../types";
import { useInventoryModule } from "../use-inventory-module";
import { InventoryDetailBlock } from "./inventory-detail-block";
import { InventoryEntityHeader } from "./inventory-entity-header";
import { ProductSerialsSection } from "./product-serials-section";
import { ProductVariantsSection } from "./product-variants-section";

type InventoryProductDetailProps = {
  productId: string;
};

function InventoryProductDetail({ productId }: InventoryProductDetailProps) {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canViewProduct = can("products.view");
  const productQuery = useProductQuery(productId, canRunTenantQueries && canViewProduct);
  const productPricesQuery = useProductPricesQuery(
    productId,
    canRunTenantQueries && can("product_prices.view"),
  );
  const stockQuery = useWarehouseStockQuery(canRunTenantQueries && can("warehouse_stock.view"));
  const lotsQuery = useInventoryLotsQuery(canRunTenantQueries && can("inventory_lots.view"));
  const movementsQuery = useInventoryMovementsQuery(
    canRunTenantQueries && can("inventory_movements.view"),
  );
  const promotionsQuery = usePromotionsQuery(canRunTenantQueries && can("promotions.view"));

  if (!canViewProduct) {
    return (
      <ErrorState
        description={t("inventory.access_denied_description")}
        title={t("inventory.access_denied_title")}
      />
    );
  }

  if (productQuery.isLoading) {
    return <LoadingState description={t("inventory.detail.loading_product")} />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <ErrorState
        description={t("inventory.detail.product_not_found_description")}
        title={t("inventory.detail.product_not_found_title")}
      />
    );
  }

  const product = productQuery.data;
  const stockRows = (stockQuery.data ?? []).filter((row) => row.product.id === product.id);
  const lotRows = (lotsQuery.data ?? []).filter((lot) => lot.product.id === product.id);
  const movementRows = (movementsQuery.data ?? [])
    .filter((movement) => movement.lines.some((line) => line.product.id === product.id))
    .sort((a, b) => {
      const aDate = a.occurred_at ? new Date(a.occurred_at).getTime() : 0;
      const bDate = b.occurred_at ? new Date(b.occurred_at).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 8);
  const promotions = (promotionsQuery.data ?? []).filter((promotion) =>
    promotion.items.some((item) => item.product.id === product.id),
  );
  const productPriceColumns: ColumnDef<ProductPrice>[] = [
    {
      accessorKey: "price_list",
      header: t("inventory.entity.price_list"),
      cell: ({ row }) => row.original.price_list?.name ?? t("inventory.common.not_available"),
    },
    {
      accessorKey: "price",
      header: t("inventory.form.price"),
      cell: ({ row }) => `${row.original.price} ${row.original.price_list?.currency ?? "CRC"}`,
    },
    {
      accessorKey: "valid_from",
      header: t("inventory.form.validity"),
      cell: ({ row }) =>
        `${formatDateTime(row.original.valid_from)} / ${formatDateTime(row.original.valid_to)}`,
    },
  ];

  const stockColumns: ColumnDef<WarehouseStockRow>[] = [
    {
      accessorKey: "warehouse",
      header: t("inventory.entity.warehouse"),
      cell: ({ row }) => row.original.warehouse.name,
    },
    {
      accessorKey: "product_variant",
      header: t("inventory.detail.variant_label"),
      cell: ({ row }) =>
        row.original.product_variant?.variant_name ??
        row.original.product_variant?.sku ??
        t("inventory.detail.default_variant"),
    },
    {
      accessorKey: "quantity",
      header: t("inventory.form.on_hand_quantity"),
      cell: ({ row }) => row.original.quantity ?? 0,
    },
    {
      accessorKey: "available_quantity",
      header: t("inventory.form.available_quantity"),
      cell: ({ row }) => row.original.available_quantity ?? 0,
    },
  ];

  const lotColumns: ColumnDef<InventoryLot>[] = [
    {
      accessorKey: "lot_number",
      header: t("inventory.form.lot_number"),
    },
    {
      accessorKey: "warehouse",
      header: t("inventory.entity.warehouse"),
      cell: ({ row }) => row.original.warehouse.name,
    },
    {
      accessorKey: "current_quantity",
      header: t("inventory.form.current_quantity"),
      cell: ({ row }) => row.original.current_quantity ?? row.original.initial_quantity ?? 0,
    },
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
      cell: ({ row }) => row.original.code ?? row.original.id,
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
      accessorKey: "lines",
      header: t("inventory.entity.warehouse"),
      cell: ({ row }) => row.original.lines[0]?.warehouse.name ?? t("inventory.common.not_available"),
    },
    {
      accessorKey: "line_count",
      header: t("inventory.form.quantity"),
      cell: ({ row }) => row.original.line_count ?? row.original.lines.length,
    },
    {
      accessorKey: "occurred_at",
      header: t("inventory.form.occurred_at"),
      cell: ({ row }) => formatDateTime(row.original.occurred_at),
    },
  ];

  const promotionColumns: ColumnDef<Promotion>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.promotion"),
    },
    {
      accessorKey: "type",
      header: t("inventory.form.promotion_type"),
      cell: ({ row }) =>
        row.original.type
          ? t(`inventory.enum.promotion_type.${row.original.type}` as const)
          : t("inventory.common.not_available"),
    },
    {
      accessorKey: "valid_to",
      header: t("inventory.form.validity"),
      cell: ({ row }) => `${formatDateTime(row.original.valid_from)} / ${formatDateTime(row.original.valid_to)}`,
    },
  ];

  return (
    <div className="space-y-6">
      <InventoryEntityHeader
        backHref={APP_ROUTES.inventoryProducts}
        backLabel={t("inventory.detail.back_to_products")}
        badges={
          <>
            <Badge variant={product.is_active ? "default" : "outline"}>
              {product.is_active ? t("inventory.common.active") : t("inventory.common.inactive")}
            </Badge>
            <Badge variant="outline">
              {product.type
                ? t(`inventory.enum.product_type.${product.type}` as const)
                : t("inventory.common.not_available")}
            </Badge>
            {product.track_inventory ? (
              <Badge variant="outline">{t("inventory.form.track_inventory")}</Badge>
            ) : null}
            {product.has_variants ? (
              <Badge variant="outline">{t("inventory.form.has_variants")}</Badge>
            ) : null}
          </>
        }
        breadcrumbs={[
          { href: APP_ROUTES.inventory, label: t("inventory.page_title") },
          { href: APP_ROUTES.inventoryProducts, label: t("inventory.nav.products") },
          { label: product.name },
        ]}
        code={product.code}
        description={t("inventory.detail.product_description")}
        title={product.name}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DataCard
          description={t("inventory.detail.product_kpi_prices")}
          title={t("inventory.entity.product_prices")}
          value={productPricesQuery.data?.length ?? 0}
        />
        <DataCard
          description={t("inventory.detail.product_kpi_stock")}
          title={t("inventory.entity.warehouse_stock")}
          value={stockRows.length}
        />
        <DataCard
          description={t("inventory.detail.product_kpi_lots")}
          title={t("inventory.entity.inventory_lots")}
          value={lotRows.length}
        />
        <DataCard
          description={t("inventory.detail.product_kpi_promotions")}
          title={t("inventory.entity.promotions")}
          value={promotions.length}
        />
      </div>

      <InventoryDetailBlock
        description={t("inventory.detail.summary_block_description")}
        title={t("inventory.detail.summary_block_title")}
      >
        <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="text-sm text-muted-foreground">{t("inventory.entity.brand")}</dt>
            <dd className="font-medium">{product.brand?.name ?? t("inventory.common.not_available")}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{t("inventory.entity.category")}</dt>
            <dd className="font-medium">{product.category?.name ?? t("inventory.common.not_available")}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{t("inventory.form.tax_profile")}</dt>
            <dd className="font-medium">{product.tax_profile?.name ?? t("inventory.common.not_available")}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{t("inventory.form.warranty_profile")}</dt>
            <dd className="font-medium">
              {product.warranty_profile?.name ?? t("inventory.common.not_available")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">SKU</dt>
            <dd className="font-medium">{product.sku ?? t("inventory.common.not_available")}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{t("inventory.form.barcode")}</dt>
            <dd className="font-medium">{product.barcode ?? t("inventory.common.not_available")}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{t("inventory.form.stock_unit")}</dt>
            <dd className="font-medium">{product.stock_unit?.name ?? t("inventory.common.not_available")}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{t("inventory.form.sale_unit")}</dt>
            <dd className="font-medium">{product.sale_unit?.name ?? t("inventory.common.not_available")}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{t("inventory.common.updated")}</dt>
            <dd className="font-medium">{formatDateTime(product.updated_at)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{t("inventory.detail.created_at")}</dt>
            <dd className="font-medium">{formatDateTime(product.created_at)}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          {product.description ?? t("inventory.common.no_description")}
        </div>
      </InventoryDetailBlock>

      <ProductVariantsSection product={product} />
      <ProductSerialsSection product={product} />

      <div className="grid gap-6 xl:grid-cols-2">
        <InventoryDetailBlock
          description={t("inventory.detail.price_block_description")}
          title={t("inventory.entity.product_prices")}
        >
          <DataTable
            enablePagination={false}
            columns={productPriceColumns}
            data={productPricesQuery.data ?? []}
            emptyMessage={t("inventory.detail.no_product_prices")}
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
          {stockRows.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {stockRows.slice(0, 3).map((row) => (
                <Badge key={row.id} variant="outline">
                  <Link href={getInventoryWarehouseRoute(row.warehouse.id)}>{row.warehouse.name}</Link>
                </Badge>
              ))}
            </div>
          ) : null}
        </InventoryDetailBlock>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InventoryDetailBlock
          description={t("inventory.detail.promotion_block_description")}
          title={t("inventory.entity.promotions")}
        >
          <DataTable
            enablePagination={false}
            columns={promotionColumns}
            data={promotions}
            emptyMessage={t("inventory.detail.no_related_promotions")}
          />
        </InventoryDetailBlock>

        <InventoryDetailBlock
          description={t("inventory.detail.lots_block_description")}
          title={t("inventory.entity.inventory_lots")}
        >
          <DataTable
            enablePagination={false}
            columns={lotColumns}
            data={lotRows}
            emptyMessage={t("inventory.detail.no_related_lots")}
          />
        </InventoryDetailBlock>
      </div>

      <InventoryDetailBlock
        description={t("inventory.detail.movements_block_description")}
        title={t("inventory.detail.recent_movements_title")}
      >
        <DataTable
          enablePagination={false}
          columns={movementColumns}
            data={movementRows}
            emptyMessage={t("inventory.detail.no_recent_movements")}
        />
        {movementRows.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {movementRows.slice(0, 4).map((row) => (
              <Badge key={`${row.id}-link`} variant="outline">
                <Link href={getInventoryMovementRoute(row.id)}>
                  {row.code ?? `${t("inventory.form.header_id")} ${row.id}`}
                </Link>
              </Badge>
            ))}
          </div>
        ) : null}
      </InventoryDetailBlock>
    </div>
  );
}

export { InventoryProductDetail };
