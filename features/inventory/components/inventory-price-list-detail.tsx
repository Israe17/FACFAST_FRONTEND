"use client";

import { useQueries } from "@tanstack/react-query";
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

import { listProductPrices } from "../api";
import { inventoryKeys, usePriceListQuery, useProductsQuery, usePromotionsQuery } from "../queries";
import type { ProductPrice, Promotion } from "../types";
import { useInventoryModule } from "../use-inventory-module";
import { InventoryDetailBlock } from "./inventory-detail-block";
import { InventoryEntityHeader } from "./inventory-entity-header";
import { PriceListBranchAssignmentsSection } from "./price-list-branch-assignments-section";

type InventoryPriceListDetailProps = {
  priceListId: string;
};

type RelatedProductPriceRow = ProductPrice & {
  product_name: string;
};

function getCoverageLabel(price: ProductPrice, t: ReturnType<typeof useAppTranslator>["t"]) {
  if (!price.product_variant || price.product_variant.is_default) {
    return t("inventory.common.all_variants");
  }

  return (
    price.product_variant.variant_name ??
    price.product_variant.sku ??
    t("inventory.common.not_available")
  );
}

function InventoryPriceListDetail({ priceListId }: InventoryPriceListDetailProps) {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canViewPriceList = can("price_lists.view");
  const canSeeRelatedPrices = can("products.view") && can("product_prices.view");
  const priceListQuery = usePriceListQuery(priceListId, canRunTenantQueries && canViewPriceList);
  const productsQuery = useProductsQuery(canRunTenantQueries && canSeeRelatedPrices);
  const promotionsQuery = usePromotionsQuery(canRunTenantQueries && can("promotions.view"));
  const products = productsQuery.data ?? [];

  const priceQueries = useQueries({
    queries: products.map((product) => ({
      enabled: canRunTenantQueries && canSeeRelatedPrices,
      queryFn: () => listProductPrices(product.id),
      queryKey: inventoryKeys.productPrices(product.id),
    })),
  });

  if (!canViewPriceList) {
    return (
      <ErrorState
        description={t("inventory.access_denied_description")}
        title={t("inventory.access_denied_title")}
      />
    );
  }

  if (priceListQuery.isLoading) {
    return <LoadingState description={t("inventory.detail.loading_price_list")} />;
  }

  if (priceListQuery.isError || !priceListQuery.data) {
    return (
      <ErrorState
        description={t("inventory.detail.price_list_not_found_description")}
        title={t("inventory.detail.price_list_not_found_title")}
      />
    );
  }

  const priceList = priceListQuery.data;
  const relatedProductPrices: RelatedProductPriceRow[] = priceQueries.flatMap((query, index) => {
    const product = products[index];

    if (!product || !query.data) {
      return [];
    }

    return query.data
      .filter((item) => item.price_list?.id === priceList.id)
      .map((item) => ({
        ...item,
        product_name: product.name,
      }));
  });

  const relatedPromotions = (promotionsQuery.data ?? []).filter((promotion) =>
    promotion.items.some((item) =>
      relatedProductPrices.some((price) => price.product_id === item.product.id),
    ),
  );

  const activePrices = relatedProductPrices.filter((price) => price.is_active).length;

  const priceColumns: ColumnDef<RelatedProductPriceRow>[] = [
    {
      accessorKey: "product_name",
      header: t("inventory.entity.product"),
    },
    {
      accessorKey: "coverage",
      header: t("inventory.common.coverage"),
      cell: ({ row }) => getCoverageLabel(row.original, t),
    },
    {
      accessorKey: "price",
      header: t("inventory.form.price"),
      cell: ({ row }) => `${row.original.price} ${row.original.price_list?.currency ?? "CRC"}`,
    },
    {
      accessorKey: "min_quantity",
      header: t("inventory.form.min_quantity"),
      cell: ({ row }) => row.original.min_quantity ?? t("inventory.common.not_available"),
    },
    {
      accessorKey: "valid_to",
      header: t("inventory.form.validity"),
      cell: ({ row }) => `${formatDateTime(row.original.valid_from)} / ${formatDateTime(row.original.valid_to)}`,
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
        backHref={APP_ROUTES.inventoryPricing}
        backLabel={t("inventory.detail.back_to_pricing")}
        badges={
          <>
            <Badge variant={priceList.is_active ? "default" : "outline"}>
              {priceList.is_active ? t("inventory.common.active") : t("inventory.common.inactive")}
            </Badge>
            {priceList.is_default ? <Badge>{t("inventory.form.default_price_list")}</Badge> : null}
            {priceList.kind ? (
              <Badge variant="outline">
                {t(`inventory.enum.price_list_kind.${priceList.kind}` as const)}
              </Badge>
            ) : null}
          </>
        }
        breadcrumbs={[
          { href: APP_ROUTES.inventory, label: t("inventory.page_title") },
          { href: APP_ROUTES.inventoryPricing, label: t("inventory.nav.pricing") },
          { label: priceList.name },
        ]}
        code={priceList.code}
        description={t("inventory.detail.price_list_description")}
        title={priceList.name}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DataCard
          description={t("inventory.detail.price_list_kpi_prices")}
          title={t("inventory.entity.product_prices")}
          value={relatedProductPrices.length}
        />
        <DataCard
          description={t("inventory.detail.price_list_kpi_active_prices")}
          title={t("inventory.common.status")}
          value={activePrices}
        />
        <DataCard
          description={t("inventory.detail.price_list_kpi_currency")}
          title={t("inventory.common.currency")}
          value={priceList.currency ?? "CRC"}
        />
        <DataCard
          description={t("inventory.detail.price_list_kpi_promotions")}
          title={t("inventory.entity.promotions")}
          value={relatedPromotions.length}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <InventoryDetailBlock
          description={t("inventory.detail.summary_block_description")}
          title={t("inventory.detail.summary_block_title")}
        >
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.common.kind")}</dt>
              <dd className="font-medium">
                {priceList.kind
                  ? t(`inventory.enum.price_list_kind.${priceList.kind}` as const)
                  : t("inventory.common.not_available")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.common.currency")}</dt>
              <dd className="font-medium">{priceList.currency ?? t("inventory.common.not_available")}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.common.updated")}</dt>
              <dd className="font-medium">{formatDateTime(priceList.updated_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.detail.created_at")}</dt>
              <dd className="font-medium">{formatDateTime(priceList.created_at)}</dd>
            </div>
          </dl>
        </InventoryDetailBlock>

        <InventoryDetailBlock
          description={t("inventory.detail.pricing_phase_block_description")}
          title={t("inventory.detail.pricing_phase_block_title")}
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>{t("inventory.detail.price_list_phase_note_1")}</p>
            <p>{t("inventory.detail.price_list_phase_note_2")}</p>
            <p>{t("inventory.detail.price_list_phase_note_3")}</p>
          </div>
        </InventoryDetailBlock>
      </div>

      <PriceListBranchAssignmentsSection
        enabled={canRunTenantQueries}
        priceList={priceList}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <InventoryDetailBlock
          description={t("inventory.detail.price_list_prices_block_description")}
          title={t("inventory.entity.product_prices")}
        >
          <p className="mb-4 text-sm text-muted-foreground">
            {t("inventory.detail.price_list_public_contract_note")}
          </p>
          <DataTable
            enablePagination={false}
            columns={priceColumns}
            data={relatedProductPrices}
            emptyMessage={t("inventory.detail.no_price_list_prices")}
          />
        </InventoryDetailBlock>

        <InventoryDetailBlock
          description={t("inventory.detail.price_list_promotions_block_description")}
          title={t("inventory.entity.promotions")}
        >
          <DataTable
            enablePagination={false}
            columns={promotionColumns}
            data={relatedPromotions}
            emptyMessage={t("inventory.detail.no_related_promotions")}
          />
        </InventoryDetailBlock>
      </div>
    </div>
  );
}

export { InventoryPriceListDetail };
