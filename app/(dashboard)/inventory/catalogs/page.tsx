"use client";

import { useMemo, useState } from "react";

import { DataCard } from "@/shared/components/data-card";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";

import { BrandsSection } from "@/features/inventory/components/brands-section";
import { InventorySectionSwitcher } from "@/features/inventory/components/inventory-section-switcher";
import { MeasurementUnitsSection } from "@/features/inventory/components/measurement-units-section";
import { ProductCategoriesSection } from "@/features/inventory/components/product-categories-section";
import { TaxProfilesSection } from "@/features/inventory/components/tax-profiles-section";
import { WarrantyProfilesSection } from "@/features/inventory/components/warranty-profiles-section";
import {
  useBrandsQuery,
  useMeasurementUnitsQuery,
  useProductCategoriesQuery,
  useTaxProfilesQuery,
  useWarrantyProfilesQuery,
} from "@/features/inventory/queries";
import { useInventoryModule } from "@/features/inventory/use-inventory-module";

const DEFAULT_CATALOG_VIEW = "categories";

export default function InventoryCatalogsPage() {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const [activeView, setActiveView] = useState(DEFAULT_CATALOG_VIEW);
  const categoriesQuery = useProductCategoriesQuery(canRunTenantQueries && can("categories.view"));
  const brandsQuery = useBrandsQuery(canRunTenantQueries && can("brands.view"));
  const unitsQuery = useMeasurementUnitsQuery(canRunTenantQueries && can("measurement_units.view"));
  const taxProfilesQuery = useTaxProfilesQuery(canRunTenantQueries && can("tax_profiles.view"));
  const warrantyProfilesQuery = useWarrantyProfilesQuery(
    canRunTenantQueries && can("warranty_profiles.view"),
  );

  const switcherItems = useMemo(
    () =>
      [
        can("categories.view")
          ? {
              description: t("inventory.catalogs.switcher.categories_description"),
              id: "categories",
              label: t("inventory.entity.product_categories"),
            }
          : null,
        can("brands.view")
          ? {
              description: t("inventory.catalogs.switcher.brands_description"),
              id: "brands",
              label: t("inventory.entity.brands"),
            }
          : null,
        can("measurement_units.view")
          ? {
              description: t("inventory.catalogs.switcher.units_description"),
              id: "units",
              label: t("inventory.entity.measurement_units"),
            }
          : null,
        can("tax_profiles.view")
          ? {
              description: t("inventory.catalogs.switcher.tax_profiles_description"),
              id: "tax_profiles",
              label: t("inventory.entity.tax_profiles"),
            }
          : null,
        can("warranty_profiles.view")
          ? {
              description: t("inventory.catalogs.switcher.warranty_profiles_description"),
              id: "warranty_profiles",
              label: t("inventory.entity.warranty_profiles"),
            }
          : null,
      ].filter(Boolean) as Array<{ description: string; id: string; label: string }>,
    [can, t],
  );

  const hasCatalogAccess =
    can("categories.view") ||
    can("brands.view") ||
    can("measurement_units.view") ||
    can("tax_profiles.view") ||
    can("warranty_profiles.view");
  const resolvedActiveView = switcherItems.some((item) => item.id === activeView)
    ? activeView
    : (switcherItems[0]?.id ?? DEFAULT_CATALOG_VIEW);

  if (!hasCatalogAccess) {
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
        description={t("inventory.catalogs.page_description")}
        eyebrow={t("inventory.nav.catalogs")}
        title={t("inventory.catalogs.page_title")}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <DataCard
          description={t("inventory.catalogs.summary.categories")}
          title={t("inventory.entity.product_categories")}
          value={categoriesQuery.data?.length ?? 0}
        />
        <DataCard
          description={t("inventory.catalogs.summary.brands")}
          title={t("inventory.entity.brands")}
          value={brandsQuery.data?.length ?? 0}
        />
        <DataCard
          description={t("inventory.catalogs.summary.units")}
          title={t("inventory.entity.measurement_units")}
          value={unitsQuery.data?.length ?? 0}
        />
        <DataCard
          description={t("inventory.catalogs.summary.tax_profiles")}
          title={t("inventory.entity.tax_profiles")}
          value={taxProfilesQuery.data?.length ?? 0}
        />
        <DataCard
          description={t("inventory.catalogs.summary.warranty_profiles")}
          title={t("inventory.entity.warranty_profiles")}
          value={warrantyProfilesQuery.data?.length ?? 0}
        />
      </div>

      <InventorySectionSwitcher
        activeId={resolvedActiveView}
        items={switcherItems}
        onChange={setActiveView}
      />

      {resolvedActiveView === "categories" ? <ProductCategoriesSection enabled={canRunTenantQueries} /> : null}
      {resolvedActiveView === "brands" ? <BrandsSection enabled={canRunTenantQueries} /> : null}
      {resolvedActiveView === "units" ? <MeasurementUnitsSection enabled={canRunTenantQueries} /> : null}
      {resolvedActiveView === "tax_profiles" ? <TaxProfilesSection enabled={canRunTenantQueries} /> : null}
      {resolvedActiveView === "warranty_profiles" ? (
        <WarrantyProfilesSection enabled={canRunTenantQueries} />
      ) : null}
    </div>
  );
}
