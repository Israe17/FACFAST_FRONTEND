"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { APP_ROUTES } from "@/shared/lib/routes";

import { InventoryLotsSection } from "@/features/inventory/components/inventory-lots-section";
import { useInventoryModule } from "@/features/inventory/use-inventory-module";

export default function InventoryOperationsLotsPage() {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();

  if (!can("inventory_lots.view")) {
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
        actions={
          <Button asChild variant="outline">
            <Link href={APP_ROUTES.inventoryOperations}>{t("inventory.operations.back_to_overview")}</Link>
          </Button>
        }
        description={t("inventory.operations.lots_page_description")}
        eyebrow={t("inventory.nav.operations")}
        title={t("inventory.operations.lots_page_title")}
      />

      <InventoryLotsSection enabled={canRunTenantQueries} />
    </div>
  );
}
