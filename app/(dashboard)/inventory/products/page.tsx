"use client";

import { DataCard } from "@/shared/components/data-card";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";

import { ProductsSection } from "@/features/inventory/components/products-section";
import { useProductsQuery } from "@/features/inventory/queries";
import { useInventoryModule } from "@/features/inventory/use-inventory-module";

export default function InventoryProductsPage() {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canViewProducts = can("products.view");
  const productsQuery = useProductsQuery(canRunTenantQueries && can("products.view"));
  const products = productsQuery.data ?? [];
  const activeProducts = products.filter((product) => product.is_active).length;
  const inventoryEnabledProducts = products.filter((product) => product.track_inventory).length;
  const serviceProducts = products.filter((product) => product.type === "service").length;

  if (!canViewProducts) {
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
        description={t("inventory.products.page_description")}
        eyebrow={t("inventory.nav.products")}
        title={t("inventory.products.page_title")}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DataCard
          description={t("inventory.products.summary.total")}
          title={t("inventory.entity.products")}
          value={products.length}
        />
        <DataCard
          description={t("inventory.products.summary.active")}
          title={t("inventory.common.status")}
          value={activeProducts}
        />
        <DataCard
          description={t("inventory.products.summary.inventory_enabled")}
          title={t("inventory.form.track_inventory")}
          value={inventoryEnabledProducts}
        />
        <DataCard
          description={t("inventory.products.summary.services")}
          title={t("inventory.enum.product_type.service")}
          value={serviceProducts}
        />
      </div>

      <ProductsSection enabled={canRunTenantQueries} />
    </div>
  );
}
