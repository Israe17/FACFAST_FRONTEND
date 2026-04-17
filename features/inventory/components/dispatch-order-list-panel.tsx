"use client";

import { useMemo } from "react";
import { MapPin, Truck } from "lucide-react";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { DispatchOrder, Warehouse } from "../types";
import {
  dispatchStatusColorMap,
  dispatchStatusTranslationMap,
  dispatchBorderColorMap,
  dispatchProgressColorMap,
} from "../constants";

type DispatchOrderListPanelProps = {
  orders: DispatchOrder[];
  warehouses?: Warehouse[];
  selectedOrderId: string | null;
  onOrderSelect: (orderId: string) => void;
};

function DispatchOrderListPanel({
  orders,
  warehouses = [],
  selectedOrderId,
  onOrderSelect,
}: DispatchOrderListPanelProps) {
  const { t } = useAppTranslator();

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "cancelled"),
    [orders],
  );

  return (
    <>
      <div className="sticky top-0 bg-background border-b px-3 py-2 z-10">
        <p className="text-sm font-semibold flex items-center gap-1.5">
          <Truck className="size-4" />
          {t("inventory.entity.dispatch_orders")} ({activeOrders.length})
        </p>
      </div>
      <div className="p-2 space-y-2">
        {activeOrders.map((order) => {
          const isSelected = String(order.id) === selectedOrderId;
          const stopsWithCoords = (order.stops ?? []).filter(
            (s) => s.delivery_latitude && s.delivery_longitude,
          ).length;
          const totalStops = (order.stops ?? []).length;
          const deliveredCount = (order.stops ?? []).filter(
            (s) => s.status === "delivered",
          ).length;
          const progressPercent =
            totalStops > 0 ? (deliveredCount / totalStops) * 100 : 0;
          const whId =
            order.origin_warehouse_id ?? order.origin_warehouse?.id;
          const whHasCoords = whId
            ? Boolean(
                warehouses.find((w) => String(w.id) === String(whId))
                  ?.latitude,
              )
            : false;

          return (
            <div
              key={order.id}
              role="button"
              tabIndex={0}
              className={`border-l-4 ${dispatchBorderColorMap[order.status] ?? "border-l-gray-400"} rounded-md border p-2.5 transition-colors cursor-pointer ${
                isSelected ? "bg-accent" : "hover:bg-muted/40"
              }`}
              onClick={() => onOrderSelect(String(order.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOrderSelect(String(order.id));
                }
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm truncate">
                  {order.code ?? `DO-${order.id}`}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${dispatchStatusColorMap[order.status] ?? ""}`}
                >
                  {t(
                    dispatchStatusTranslationMap[order.status] ??
                      "inventory.dispatch.status_draft",
                  )}
                </span>
              </div>

              <div className="text-xs text-muted-foreground space-y-0.5">
                {order.vehicle ? (
                  <p className="flex items-center gap-1">
                    <Truck className="size-3 shrink-0" />
                    <span className="truncate">
                      {order.vehicle.plate_number}
                    </span>
                    {order.driver_user ? (
                      <span className="truncate">
                        · {order.driver_user.name}
                      </span>
                    ) : null}
                  </p>
                ) : order.driver_user ? (
                  <p className="truncate">{order.driver_user.name}</p>
                ) : null}

                <p className="flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  {totalStops} {t("inventory.dispatch.stops_label")}
                  {stopsWithCoords < totalStops ? (
                    <span className="text-amber-600">
                      ({totalStops - stopsWithCoords}{" "}
                      {t("inventory.dispatch.stops_no_location")})
                    </span>
                  ) : null}
                </p>
                {whId && !whHasCoords ? (
                  <p className="text-amber-600">
                    ({t("inventory.dispatch.warehouse_no_location")})
                  </p>
                ) : null}
                {!whId ? (
                  <p className="text-amber-600">
                    ({t("inventory.dispatch.no_origin_warehouse")})
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5">
                <span>{t("inventory.dispatch.stops_label")}</span>
                <span className="font-medium tabular-nums">
                  {deliveredCount}/{totalStops}
                </span>
              </div>
              <div className="h-0.5 w-full rounded-full bg-muted overflow-hidden mt-0.5">
                <div
                  className={`h-full rounded-full transition-all ${dispatchProgressColorMap[order.status] ?? "bg-gray-400"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
        {activeOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("inventory.dispatch.no_dispatch_orders")}
          </p>
        ) : null}
      </div>
    </>
  );
}

export { DispatchOrderListPanel };
