"use client";

import Link from "next/link";
import { ArrowRight, Boxes, PackageSearch, ScrollText, Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/shared/components/error-state";
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
          .map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.href} className="border-border/70 bg-card/95">
              <CardHeader className="space-y-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/8 p-3 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle>{t(card.titleKey)}</CardTitle>
                  <CardDescription>{t(card.descriptionKey)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href={card.href}>
                    {t("inventory.operations.open_view")}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
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
