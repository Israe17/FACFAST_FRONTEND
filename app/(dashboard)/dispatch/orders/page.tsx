"use client";

import { usePermissions } from "@/shared/hooks/use-permissions";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import { DispatchOrdersSection } from "@/features/inventory/components/dispatch-orders-section";

export default function DispatchOrdersPage() {
  const { t } = useAppTranslator();
  const { canAny } = usePermissions();

  const hasAccess = canAny(["dispatch_orders.view"]);

  if (!hasAccess) {
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
        description={t("inventory.dispatch.section_description")}
        eyebrow={t("inventory.dispatch.landing.eyebrow")}
        title={t("inventory.entity.dispatch_orders")}
      />

      <DispatchOrdersSection />
    </div>
  );
}
