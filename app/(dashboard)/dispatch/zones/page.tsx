"use client";

import { usePermissions } from "@/shared/hooks/use-permissions";
import { ErrorState } from "@/shared/components/error-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import { ZonesSection } from "@/features/inventory/components/zones-section";

export default function DispatchZonesPage() {
  const { t } = useAppTranslator();
  const { canAny } = usePermissions();

  const hasAccess = canAny(["zones.view"]);

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
        description={t("inventory.zones.section_description")}
        eyebrow={t("inventory.dispatch.landing.eyebrow")}
        title={t("inventory.entity.zones")}
      />

      <ZonesSection />
    </div>
  );
}
