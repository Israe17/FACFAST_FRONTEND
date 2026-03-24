"use client";

import { MapPin, Route, Truck } from "lucide-react";

import { ErrorState } from "@/shared/components/error-state";
import { ModuleEntryCard } from "@/shared/components/module-entry-card";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { APP_ROUTES } from "@/shared/lib/routes";

const dispatchCards = [
  {
    descriptionKey: "inventory.dispatch.landing.orders_description",
    href: APP_ROUTES.dispatchOrders,
    icon: MapPin,
    permissions: ["dispatch_orders.view"],
    titleKey: "inventory.entity.dispatch_orders",
  },
  {
    descriptionKey: "inventory.dispatch.landing.routes_description",
    href: APP_ROUTES.dispatchRoutes,
    icon: Route,
    permissions: ["routes.view"],
    titleKey: "inventory.entity.routes",
  },
  {
    descriptionKey: "inventory.dispatch.landing.vehicles_description",
    href: APP_ROUTES.dispatchVehicles,
    icon: Truck,
    permissions: ["vehicles.view"],
    titleKey: "inventory.entity.vehicles",
  },
] as const;

export default function DispatchPage() {
  const { t } = useAppTranslator();
  const { canAny } = usePermissions();

  const hasAccess = canAny([
    "dispatch_orders.view",
    "routes.view",
    "vehicles.view",
  ]);

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
        description={t("inventory.dispatch.landing.description")}
        eyebrow={t("inventory.dispatch.landing.eyebrow")}
        title={t("inventory.dispatch.landing.title")}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {dispatchCards
          .filter((card) => canAny([...card.permissions]))
          .map((card) => (
            <ModuleEntryCard
              key={card.href}
              ctaLabel={t("inventory.dispatch.landing.open_section")}
              description={t(card.descriptionKey)}
              href={card.href}
              icon={card.icon}
              title={t(card.titleKey)}
            />
          ))}
      </div>
    </div>
  );
}
