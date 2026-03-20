"use client";

import { Boxes, PackageSearch, ScrollText, Warehouse } from "lucide-react";

import { ErrorState } from "@/shared/components/error-state";
import { ModuleEntryCard } from "@/shared/components/module-entry-card";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { APP_ROUTES } from "@/shared/lib/routes";

const operationCards = [
  {
    descriptionKey: "inventory.operations.cards.stock_description",
    href: APP_ROUTES.inventoryOperationsStock,
    icon: Warehouse,
    permissions: ["warehouse_stock.view"],
    titleKey: "inventory.entity.warehouse_stock",
  },
  {
    descriptionKey: "inventory.operations.cards.lots_description",
    href: APP_ROUTES.inventoryOperationsLots,
    icon: Boxes,
    permissions: ["inventory_lots.view"],
    titleKey: "inventory.entity.inventory_lots",
  },
  {
    descriptionKey: "inventory.operations.cards.movements_description",
    href: APP_ROUTES.inventoryOperationsMovements,
    icon: ScrollText,
    permissions: ["inventory_movements.view"],
    titleKey: "inventory.entity.inventory_movements",
  },
] as const;

export default function InventoryOperationsPage() {
  const { t } = useAppTranslator();
  const { canAny } = usePermissions();
  const hasOperationsAccess = canAny([
    "warehouse_stock.view",
    "inventory_lots.view",
    "inventory_movements.view",
  ]);

  if (!hasOperationsAccess) {
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
        description={t("inventory.operations.page_description")}
        eyebrow={t("inventory.nav.operations")}
        title={t("inventory.operations.page_title")}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {operationCards
          .filter((card) => canAny([...card.permissions]))
          .map((card) => (
            <ModuleEntryCard
              key={card.href}
              ctaLabel={t("inventory.operations.open_view")}
              description={t(card.descriptionKey)}
              href={card.href}
              icon={card.icon}
              title={t(card.titleKey)}
            />
          ))}
      </div>

      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-5 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <PackageSearch className="mt-0.5 size-4 shrink-0" />
          <p>{t("inventory.operations.page_hint")}</p>
        </div>
      </div>
    </div>
  );
}
