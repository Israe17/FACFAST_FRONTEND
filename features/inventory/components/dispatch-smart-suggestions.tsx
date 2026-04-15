"use client";

import { useMemo } from "react";
import { Lightbulb, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { SaleOrder } from "@/features/sales/types";

type ZoneGroup = {
  zoneName: string;
  zoneId: string;
  orders: SaleOrder[];
};

type DispatchSmartSuggestionsProps = {
  pendingOrders: SaleOrder[];
  onSelectOrders: (orderIds: string[]) => void;
  onDismiss: () => void;
  visible: boolean;
};

function DispatchSmartSuggestions({
  pendingOrders,
  onSelectOrders,
  onDismiss,
  visible,
}: DispatchSmartSuggestionsProps) {
  const { t } = useAppTranslator();

  const zoneGroups = useMemo(() => {
    const groups = new Map<string, ZoneGroup>();
    for (const order of pendingOrders) {
      const zoneId = order.delivery_zone?.id
        ? String(order.delivery_zone.id)
        : null;
      const zoneName = order.delivery_zone?.name ?? null;
      if (!zoneId || !zoneName) continue;

      const existing = groups.get(zoneId);
      if (existing) {
        existing.orders.push(order);
      } else {
        groups.set(zoneId, { zoneName, zoneId, orders: [order] });
      }
    }
    return Array.from(groups.values()).filter((g) => g.orders.length >= 2);
  }, [pendingOrders]);

  if (!visible || zoneGroups.length === 0) return null;

  const bestGroup = zoneGroups.reduce((a, b) =>
    a.orders.length >= b.orders.length ? a : b,
  );

  return (
    <div className="border rounded-lg bg-amber-50 border-amber-200 px-3 py-2.5 mx-2 mb-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Lightbulb className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-amber-900">
              {t("inventory.dispatch.suggestion_group_zone")}
            </p>
            <p className="text-xs text-amber-700">
              {t("inventory.dispatch.suggestion_group_detail", {
                count: bestGroup.orders.length,
                zone: bestGroup.zoneName,
              })}
            </p>
          </div>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          className="size-5 text-amber-600"
          onClick={onDismiss}
        >
          <X className="size-3" />
        </Button>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full mt-2 text-xs border-amber-300 hover:bg-amber-100"
        onClick={() =>
          onSelectOrders(bestGroup.orders.map((o) => String(o.id)))
        }
      >
        {t("inventory.dispatch.suggestion_select", {
          count: bestGroup.orders.length,
        })}
      </Button>
    </div>
  );
}

export { DispatchSmartSuggestions };
