"use client";

import Link from "next/link";
import { Boxes, LayoutGrid, Package, PackageSearch, ReceiptText, Warehouse } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/shared/components/data-card";
import { LoadingState } from "@/shared/components/loading-state";
import { ModuleEntryCard } from "@/shared/components/module-entry-card";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { APP_ROUTES } from "@/shared/lib/routes";

import { useBrandsQuery, usePriceListsQuery, useProductsQuery, useWarehousesQuery } from "../queries";
import { useInventoryModule } from "../use-inventory-module";

const moduleCards = [
  {
    descriptionKey: "inventory.landing.catalogs_description",
    href: APP_ROUTES.inventoryCatalogs,
    icon: LayoutGrid,
    permissions: [
      "categories.view",
      "brands.view",
      "measurement_units.view",
      "tax_profiles.view",
      "warranty_profiles.view",
    ],
    statKey: "catalogs",
    titleKey: "inventory.nav.catalogs",
  },
  {
    descriptionKey: "inventory.landing.products_description",
    href: APP_ROUTES.inventoryProducts,
    icon: Package,
    permissions: ["products.view"],
    statKey: "products",
    titleKey: "inventory.nav.products",
  },
  {
    descriptionKey: "inventory.landing.pricing_description",
    href: APP_ROUTES.inventoryPricing,
    icon: ReceiptText,
    permissions: ["price_lists.view", "product_prices.view", "promotions.view"],
    statKey: "pricing",
    titleKey: "inventory.nav.pricing",
  },
  {
    descriptionKey: "inventory.landing.warehouses_description",
    href: APP_ROUTES.inventoryWarehouses,
    icon: Warehouse,
    permissions: ["warehouses.view", "warehouse_locations.view"],
    statKey: "warehouses",
    titleKey: "inventory.nav.warehouses",
  },
  {
    descriptionKey: "inventory.landing.operations_description",
    href: APP_ROUTES.inventoryOperations,
    icon: PackageSearch,
    permissions: ["warehouse_stock.view", "inventory_lots.view", "inventory_movements.view"],
    statKey: "operations",
    titleKey: "inventory.nav.operations",
  },
] as const;

function InventoryLandingPage() {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can, canAny } = usePermissions();
  const productsQuery = useProductsQuery(canRunTenantQueries && can("products.view"));
  const brandsQuery = useBrandsQuery(canRunTenantQueries && can("brands.view"));
  const priceListsQuery = usePriceListsQuery(canRunTenantQueries && can("price_lists.view"));
  const warehousesQuery = useWarehousesQuery(canRunTenantQueries && can("warehouses.view"));

  const isLoadingOverview =
    productsQuery.isLoading || brandsQuery.isLoading || priceListsQuery.isLoading || warehousesQuery.isLoading;

  const stats = {
    catalogs: brandsQuery.data?.length ?? 0,
    operations: warehousesQuery.data?.length ?? 0,
    pricing: priceListsQuery.data?.length ?? 0,
    products: productsQuery.data?.length ?? 0,
    warehouses: warehousesQuery.data?.length ?? 0,
  } satisfies Record<(typeof moduleCards)[number]["statKey"], number>;

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button asChild>
            <Link href={APP_ROUTES.inventoryProducts}>
              <Boxes className="size-4" />
              {t("inventory.landing.primary_action")}
            </Link>
          </Button>
        }
        description={t("inventory.landing.description")}
        eyebrow={t("inventory.page_title")}
        title={t("inventory.landing.title")}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{t("inventory.page_phase_badge")}</Badge>
        <Badge variant="outline">{t("inventory.page_scope_badge")}</Badge>
        <Badge variant="outline">{t("inventory.page_tenant_aware_badge")}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DataCard
          description={t("inventory.landing.products_kpi_description")}
          title={t("inventory.landing.products_kpi_title")}
          value={productsQuery.data?.length ?? 0}
        />
        <DataCard
          description={t("inventory.landing.catalogs_kpi_description")}
          title={t("inventory.landing.catalogs_kpi_title")}
          value={brandsQuery.data?.length ?? 0}
        />
        <DataCard
          description={t("inventory.landing.pricing_kpi_description")}
          title={t("inventory.landing.pricing_kpi_title")}
          value={priceListsQuery.data?.length ?? 0}
        />
        <DataCard
          description={t("inventory.landing.warehouses_kpi_description")}
          title={t("inventory.landing.warehouses_kpi_title")}
          value={warehousesQuery.data?.length ?? 0}
        />
      </div>

      {isLoadingOverview ? (
        <LoadingState description={t("inventory.landing.loading_modules")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {moduleCards
            .filter((module) => canAny([...module.permissions]))
            .map((module) => {
              return (
                <ModuleEntryCard
                  key={module.href}
                  badge={
                    <Badge variant="outline">
                      {t("inventory.landing.records_badge", {
                        count: String(stats[module.statKey]),
                      })}
                    </Badge>
                  }
                  ctaLabel={t("inventory.landing.open_module")}
                  description={t(module.descriptionKey)}
                  href={module.href}
                  icon={module.icon}
                  title={t(module.titleKey)}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}

export { InventoryLandingPage };
