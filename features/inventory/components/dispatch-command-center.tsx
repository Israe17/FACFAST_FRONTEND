"use client";

import { useCallback, useMemo, useState } from "react";
import { Package, Truck, CheckCircle, AlertTriangle } from "lucide-react";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import type { SaleOrder } from "@/features/sales/types";
import type { DispatchOrder, Warehouse, Zone } from "../types";

import { DispatchBarCard } from "./dispatch-bar-card";
import { PendingOrderCard } from "./pending-order-card";

type DispatchCommandCenterProps = {
  pendingOrders: SaleOrder[];
  dispatchOrders: DispatchOrder[];
  warehouses: Warehouse[];
  zones: Zone[];
  onViewDispatchDetail: (order: DispatchOrder) => void;
  onOrderClick: (order: DispatchOrder) => void;
};

function DispatchCommandCenter({
  pendingOrders,
  dispatchOrders,
  warehouses,
  zones,
  onViewDispatchDetail,
}: DispatchCommandCenterProps) {
  const { t } = useAppTranslator();
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(null);
  const [selectedPendingIds, setSelectedPendingIds] = useState<Set<string>>(new Set());
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  const inRouteCount = useMemo(
    () => dispatchOrders.filter((o) => o.status === "dispatched" || o.status === "in_transit").length,
    [dispatchOrders],
  );
  const completedCount = useMemo(
    () => dispatchOrders.filter((o) => o.status === "completed").length,
    [dispatchOrders],
  );
  const overdueCount = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return pendingOrders.filter((o) => {
      const requested = o.delivery_requested_date;
      return requested && requested < today;
    }).length;
  }, [pendingOrders]);

  const togglePendingSelection = useCallback((orderId: string) => {
    setSelectedPendingIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }, []);

  const handleHighlight = useCallback((orderId: string | null) => {
    setHighlightedOrderId(orderId);
  }, []);

  const handleSelectDispatch = useCallback(
    (orderId: string) => {
      setSelectedDispatchId((prev) => (prev === orderId ? null : orderId));
    },
    [],
  );

  const selectedDispatch = useMemo(
    () => dispatchOrders.find((o) => String(o.id) === selectedDispatchId) ?? null,
    [dispatchOrders, selectedDispatchId],
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 260px)" }}>
      {/* KPIs */}
      <div className="flex items-center gap-4 px-3 py-2 border-b bg-muted/30 text-sm">
        <span className="flex items-center gap-1.5">
          <Package className="size-4 text-orange-500" />
          {pendingOrders.length} {t("inventory.dispatch.pending_orders").toLowerCase()}
        </span>
        <span className="flex items-center gap-1.5">
          <Truck className="size-4 text-blue-500" />
          {inRouteCount} {t("inventory.dispatch.status_in_transit").toLowerCase()}
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle className="size-4 text-green-500" />
          {completedCount} {t("inventory.dispatch.status_completed").toLowerCase()}
        </span>
        {overdueCount > 0 && (
          <span className="flex items-center gap-1.5 text-red-600 font-medium">
            <AlertTriangle className="size-4" />
            {overdueCount} {t("inventory.dispatch.overdue_badge").toLowerCase()}
          </span>
        )}
      </div>

      {/* Main panels */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Pending orders */}
        <div className="w-72 shrink-0 border-r overflow-y-auto p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {t("inventory.dispatch.pending_orders")} ({pendingOrders.length})
          </p>
          {pendingOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {t("inventory.dispatch.no_pending_orders")}
            </p>
          ) : (
            pendingOrders.map((order) => (
              <PendingOrderCard
                key={order.id}
                order={order}
                isSelected={selectedPendingIds.has(String(order.id))}
                isHighlighted={highlightedOrderId === String(order.id)}
                onToggleSelect={togglePendingSelection}
                onHighlight={handleHighlight}
                onAssign={() => {
                  // TODO: open assign menu
                }}
              />
            ))
          )}
        </div>

        {/* Center: Map placeholder */}
        <div className="flex-1 flex items-center justify-center bg-muted/10">
          <p className="text-muted-foreground text-sm">
            {t("inventory.dispatch.command_center")} — {t("inventory.dispatch.legend_warehouse")}
          </p>
        </div>

        {/* Right: Dispatch detail (conditional) */}
        {selectedDispatch && (
          <div className="w-80 shrink-0 border-l overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{selectedDispatch.code}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  selectedDispatch.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : selectedDispatch.status === "ready"
                      ? "bg-blue-100 text-blue-800"
                      : selectedDispatch.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                }`}
              >
                {selectedDispatch.status}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">{t("inventory.dispatch.vehicle")}:</span>{" "}
                {selectedDispatch.vehicle?.name ?? t("inventory.dispatch.no_vehicle")}
              </p>
              <p>
                <span className="text-muted-foreground">{t("inventory.dispatch.driver")}:</span>{" "}
                {selectedDispatch.driver_user?.name ?? t("inventory.dispatch.no_driver")}
              </p>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {t("inventory.dispatch.stops_label")} ({(selectedDispatch.stops ?? []).length})
              </p>
              <div className="space-y-2">
                {(selectedDispatch.stops ?? []).map((stop, idx) => (
                  <div key={stop.id} className="text-sm p-2 border rounded-lg">
                    <span className="text-muted-foreground">{idx + 1}.</span>{" "}
                    {stop.customer_contact?.name ?? stop.sale_order?.code ?? `Stop ${idx + 1}`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar: dispatch orders */}
      <div className="h-20 shrink-0 border-t overflow-x-auto">
        <div className="flex items-center gap-2 p-2 h-full">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap px-2">
            {t("inventory.dispatch.dispatches_today")}
          </p>
          {dispatchOrders.map((order) => (
            <DispatchBarCard
              key={order.id}
              order={order}
              isSelected={selectedDispatchId === String(order.id)}
              onClick={handleSelectDispatch}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { DispatchCommandCenter };
