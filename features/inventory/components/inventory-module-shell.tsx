"use client";

import Link from "next/link";
import { LayoutGrid, Package, PackageSearch, ReceiptText, Warehouse } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/shared/components/error-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import {
  APP_ROUTES,
  getInventoryMovementRoute,
  getInventoryPriceListRoute,
  getInventoryProductRoute,
  getInventoryWarehouseRoute,
} from "@/shared/lib/routes";
import { cn } from "@/shared/lib/utils";

import { useInventoryModule } from "../use-inventory-module";

type InventoryModuleShellProps = {
  children: ReactNode;
};

type InventoryNavItem = {
  href: string;
  icon: typeof LayoutGrid;
  match: (pathname: string) => boolean;
  requiredAnyPermissions: string[];
  translationKey: string;
};

const inventoryNavItems: InventoryNavItem[] = [
  {
    href: APP_ROUTES.inventoryCatalogs,
    icon: LayoutGrid,
    match: (pathname) => pathname.startsWith(APP_ROUTES.inventoryCatalogs),
    requiredAnyPermissions: [
      "categories.view",
      "brands.view",
      "measurement_units.view",
      "tax_profiles.view",
      "warranty_profiles.view",
    ],
    translationKey: "inventory.nav.catalogs",
  },
  {
    href: APP_ROUTES.inventoryProducts,
    icon: Package,
    match: (pathname) =>
      pathname.startsWith(APP_ROUTES.inventoryProducts) || pathname === getInventoryProductRoute("x").replace("/x", ""),
    requiredAnyPermissions: ["products.view"],
    translationKey: "inventory.nav.products",
  },
  {
    href: APP_ROUTES.inventoryPricing,
    icon: ReceiptText,
    match: (pathname) =>
      pathname.startsWith(APP_ROUTES.inventoryPricing) ||
      pathname === getInventoryPriceListRoute("x").replace("/price-lists/x", ""),
    requiredAnyPermissions: ["price_lists.view", "product_prices.view", "promotions.view"],
    translationKey: "inventory.nav.pricing",
  },
  {
    href: APP_ROUTES.inventoryWarehouses,
    icon: Warehouse,
    match: (pathname) =>
      pathname.startsWith(APP_ROUTES.inventoryWarehouses) ||
      pathname === getInventoryWarehouseRoute("x").replace("/x", ""),
    requiredAnyPermissions: ["warehouses.view", "warehouse_locations.view"],
    translationKey: "inventory.nav.warehouses",
  },
  {
    href: APP_ROUTES.inventoryOperations,
    icon: PackageSearch,
    match: (pathname) =>
      pathname.startsWith(APP_ROUTES.inventoryOperations) ||
      pathname === getInventoryMovementRoute("x").replace("/movements/x", ""),
    requiredAnyPermissions: ["warehouse_stock.view", "inventory_lots.view", "inventory_movements.view"],
    translationKey: "inventory.nav.operations",
  },
];

function InventoryModuleShell({ children }: InventoryModuleShellProps) {
  const pathname = usePathname();
  const { t } = useAppTranslator();
  const { canAny } = usePermissions();
  const {
    activeBranchId,
    activeBusinessId,
    activeBusinessName,
    hasAnyInventoryAccess,
    isBusinessLevelContext,
    mode,
  } = useInventoryModule();

  if (!hasAnyInventoryAccess) {
    return (
      <ErrorState
        description={t("inventory.access_denied_description")}
        title={t("inventory.access_denied_title")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardContent className="space-y-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                {t("inventory.module_eyebrow")}
              </p>
              <h2 className="text-xl font-semibold tracking-tight">{t("inventory.module_title")}</h2>
              <p className="max-w-3xl text-sm text-muted-foreground">
                {t("inventory.module_description")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {t("inventory.context.business_label")}: {activeBusinessName ?? activeBusinessId ?? "N/D"}
              </Badge>
              <Badge variant="outline">
                {t("inventory.context.branch_label")}:{" "}
                {isBusinessLevelContext ? t("inventory.context.company_level") : (activeBranchId ?? "N/D")}
              </Badge>
              <Badge variant="outline">
                {t("inventory.context.mode_label")}: {mode ?? "tenant"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-5">
            {inventoryNavItems
              .filter((item) => canAny(item.requiredAnyPermissions))
              .map((item) => {
              const isActive = item.match(pathname);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  className={cn(
                    "rounded-2xl border px-4 py-3 transition-colors",
                    isActive
                      ? "border-primary/40 bg-primary/8 text-foreground"
                      : "border-border/70 bg-background hover:border-primary/30 hover:bg-muted/60",
                  )}
                  href={item.href}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "rounded-xl border p-2",
                        isActive
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/70 bg-card text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{t(item.translationKey as never)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}

export { InventoryModuleShell };
