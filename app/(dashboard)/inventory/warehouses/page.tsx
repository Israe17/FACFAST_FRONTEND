"use client";

import { DataCard } from "@/shared/components/data-card";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";

import { WarehousesSection } from "@/features/inventory/components/warehouses-section";
import { useWarehousesQuery } from "@/features/inventory/queries";
import { useInventoryModule } from "@/features/inventory/use-inventory-module";

export default function InventoryWarehousesPage() {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canViewWarehouses = can("warehouses.view");
  const warehousesQuery = useWarehousesQuery(canRunTenantQueries && canViewWarehouses);
  const warehouses = warehousesQuery.data ?? [];
  const activeWarehouses = warehouses.filter((warehouse) => warehouse.is_active).length;
  const defaultWarehouses = warehouses.filter((warehouse) => warehouse.is_default).length;
  const locatedWarehouses = warehouses.filter((warehouse) => warehouse.uses_locations).length;

  if (!canViewWarehouses) {
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
        description={t("inventory.warehouses.page_description")}
        eyebrow={t("inventory.nav.warehouses")}
        title={t("inventory.warehouses.page_title")}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DataCard
          description={t("inventory.warehouses.summary.total")}
          title={t("inventory.entity.warehouses")}
          value={warehouses.length}
        />
        <DataCard
          description={t("inventory.warehouses.summary.active")}
          title={t("inventory.common.status")}
          value={activeWarehouses}
        />
        <DataCard
          description={t("inventory.warehouses.summary.default")}
          title={t("inventory.form.default_warehouse")}
          value={defaultWarehouses}
        />
        <DataCard
          description={t("inventory.warehouses.summary.locations")}
          title={t("inventory.form.uses_locations")}
          value={locatedWarehouses}
        />
      </div>

      <WarehousesSection enabled={canRunTenantQueries} />
    </div>
  );
}
