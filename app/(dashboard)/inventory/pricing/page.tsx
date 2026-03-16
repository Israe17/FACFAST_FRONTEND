"use client";

import { useMemo, useState } from "react";

import { DataCard } from "@/shared/components/data-card";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";

import { InventorySectionSwitcher } from "@/features/inventory/components/inventory-section-switcher";
import { PriceListsSection } from "@/features/inventory/components/price-lists-section";
import { ProductPricesSection } from "@/features/inventory/components/product-prices-section";
import { PromotionsSection } from "@/features/inventory/components/promotions-section";
import { usePriceListsQuery, usePromotionsQuery } from "@/features/inventory/queries";
import { useInventoryModule } from "@/features/inventory/use-inventory-module";

const DEFAULT_PRICING_VIEW = "price_lists";

export default function InventoryPricingPage() {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canViewPricing = can("price_lists.view") || can("product_prices.view") || can("promotions.view");
  const [activeView, setActiveView] = useState(DEFAULT_PRICING_VIEW);
  const priceListsQuery = usePriceListsQuery(canRunTenantQueries && can("price_lists.view"));
  const promotionsQuery = usePromotionsQuery(canRunTenantQueries && can("promotions.view"));
  const activePriceLists = (priceListsQuery.data ?? []).filter((item) => item.is_active).length;
  const activePromotions = (promotionsQuery.data ?? []).filter((item) => item.is_active).length;

  const switcherItems = useMemo(
    () =>
      [
        can("price_lists.view")
          ? {
              description: t("inventory.pricing.switcher.price_lists_description"),
              id: "price_lists",
              label: t("inventory.entity.price_lists"),
            }
          : null,
        can("product_prices.view")
          ? {
              description: t("inventory.pricing.switcher.product_prices_description"),
              id: "product_prices",
              label: t("inventory.entity.product_prices"),
            }
          : null,
        can("promotions.view")
          ? {
              description: t("inventory.pricing.switcher.promotions_description"),
              id: "promotions",
              label: t("inventory.entity.promotions"),
            }
          : null,
      ].filter(Boolean) as Array<{ description: string; id: string; label: string }>,
    [can, t],
  );

  if (!canViewPricing) {
    return (
      <ErrorState
        description={t("inventory.access_denied_description")}
        title={t("inventory.access_denied_title")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description={t("inventory.pricing.page_description")}
        eyebrow={t("inventory.nav.pricing")}
        title={t("inventory.pricing.page_title")}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DataCard
          description={t("inventory.pricing.summary.price_lists")}
          title={t("inventory.entity.price_lists")}
          value={priceListsQuery.data?.length ?? 0}
        />
        <DataCard
          description={t("inventory.pricing.summary.active_price_lists")}
          title={t("inventory.form.default_price_list")}
          value={activePriceLists}
        />
        <DataCard
          description={t("inventory.pricing.summary.promotions")}
          title={t("inventory.entity.promotions")}
          value={activePromotions}
        />
      </div>

      <InventorySectionSwitcher activeId={activeView} items={switcherItems} onChange={setActiveView} />

      {activeView === "price_lists" ? <PriceListsSection enabled={canRunTenantQueries} /> : null}
      {activeView === "product_prices" ? <ProductPricesSection enabled={canRunTenantQueries} /> : null}
      {activeView === "promotions" ? <PromotionsSection enabled={canRunTenantQueries} /> : null}
    </div>
  );
}
