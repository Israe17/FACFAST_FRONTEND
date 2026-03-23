"use client";

import { usePermissions } from "@/shared/hooks/use-permissions";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import { SaleOrdersSection } from "@/features/sales/components/sale-orders-section";
import { ElectronicDocumentsSection } from "@/features/sales/components/electronic-documents-section";

export default function SalesPage() {
  const { t } = useAppTranslator();
  const { canAny } = usePermissions();

  const hasAccess = canAny(["sale_orders.view", "electronic_documents.view"]);

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
        description={t("sales.section_description")}
        eyebrow={t("sales.entity.sale_orders")}
        title={t("sales.entity.sale_orders")}
      />

      <SaleOrdersSection />
      <ElectronicDocumentsSection />
    </div>
  );
}
