"use client";

import { useCallback, useMemo, useState } from "react";
import { Package, Plus, Truck, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { SaleOrder } from "@/features/sales/types";

import { useAddDispatchStopMutation } from "../queries";
import type { DispatchOrder, Warehouse, Zone } from "../types";
import { DispatchBarCard } from "./dispatch-bar-card";
import { DispatchCommandDetailPanel } from "./dispatch-command-detail-panel";
import { DispatchMapView } from "./dispatch-map-view";
import { DispatchSmartSuggestions } from "./dispatch-smart-suggestions";
import { PendingOrderCard } from "./pending-order-card";

type DispatchCommandCenterProps = {
  pendingOrders: SaleOrder[];
  dispatchOrders: DispatchOrder[];
  warehouses: Warehouse[];
  zones: Zone[];
  onCreateDispatch: () => void;
  onViewDispatchDetail: (order: DispatchOrder) => void;
};

function DispatchCommandCenter({
  pendingOrders,
  dispatchOrders,
  warehouses,
  zones,
  onCreateDispatch,
  onViewDispatchDetail,
}: DispatchCommandCenterProps) {
  const { t } = useAppTranslator();

  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(
    null,
  );
  const [selectedPendingIds, setSelectedPendingIds] = useState<Set<string>>(
    new Set(),
  );
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(
    null,
  );
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);

  // Mutation for adding stops to the currently selected DO
  const addStopMutation = useAddDispatchStopMutation(
    selectedDispatchId ?? "",
    { showErrorToast: true },
  );

  // --- KPI counts ---
  const pendingCount = pendingOrders.length;

  const inRouteCount = useMemo(
    () =>
      dispatchOrders.filter(
        (o) => o.status === "dispatched" || o.status === "in_transit",
      ).length,
    [dispatchOrders],
  );

  const completedCount = useMemo(
    () => dispatchOrders.filter((o) => o.status === "completed").length,
    [dispatchOrders],
  );

  // --- Selected dispatch order for detail panel ---
  const selectedDispatchOrder = useMemo(
    () =>
      dispatchOrders.find((o) => String(o.id) === selectedDispatchId) ?? null,
    [dispatchOrders, selectedDispatchId],
  );

  // --- Editable DOs for assignment target ---
  const editableDispatches = useMemo(
    () =>
      dispatchOrders.filter(
        (o) => o.status === "draft" || o.status === "ready",
      ),
    [dispatchOrders],
  );

  const selectedCount = selectedPendingIds.size;

  // Check if selected DO can accept new stops
  const canAssignToSelected = useMemo(() => {
    if (!selectedDispatchOrder) return false;
    if (!selectedDispatchOrder.lifecycle?.can_edit) return false;
    if (
      selectedDispatchOrder.dispatch_type === "individual" &&
      (selectedDispatchOrder.stops ?? []).length > 0
    ) {
      return false;
    }
    return true;
  }, [selectedDispatchOrder]);

  // --- Handlers ---
  const handleTogglePendingSelect = useCallback((orderId: string) => {
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

  const handleAssignSingle = useCallback(
    async (orderId: string) => {
      if (selectedDispatchId && canAssignToSelected) {
        const nextSeq = (selectedDispatchOrder?.stops ?? []).length + 1;
        await addStopMutation.mutateAsync({
          sale_order_id: orderId,
          delivery_sequence: nextSeq,
        });
      } else {
        onCreateDispatch();
      }
    },
    [selectedDispatchId, canAssignToSelected, selectedDispatchOrder, addStopMutation, onCreateDispatch],
  );

  const handleBulkAssign = useCallback(async () => {
    if (!selectedDispatchId || selectedCount === 0) return;
    let seq = (selectedDispatchOrder?.stops ?? []).length + 1;
    for (const saleOrderId of selectedPendingIds) {
      await addStopMutation.mutateAsync({
        sale_order_id: saleOrderId,
        delivery_sequence: seq++,
      });
    }
    setSelectedPendingIds(new Set());
  }, [selectedDispatchId, selectedCount, selectedPendingIds, selectedDispatchOrder, addStopMutation]);

  const handleDispatchBarClick = useCallback(
    (orderId: string) => {
      setSelectedDispatchId((prev) => (prev === orderId ? null : orderId));
    },
    [],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedDispatchId(null);
  }, []);

  const handleSuggestionSelect = useCallback((orderIds: string[]) => {
    setSelectedPendingIds(new Set(orderIds));
    setSuggestionsVisible(false);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] overflow-x-auto">
      {/* Top KPIs bar */}
      <div className="flex items-center gap-6 border-b px-4 py-2.5 shrink-0 bg-background min-w-[960px]">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-orange-500" />
          <span className="text-sm text-muted-foreground">
            {t("inventory.dispatch.pending_orders")}
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {pendingCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-indigo-500" />
          <span className="text-sm text-muted-foreground">
            {t("inventory.dispatch.in_route")}
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {inRouteCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-green-500" />
          <span className="text-sm text-muted-foreground">
            {t("inventory.dispatch.completed")}
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {completedCount}
          </span>
        </div>
      </div>

      {/* Main 3-panel layout */}
      <div className="flex flex-1 min-h-0 min-w-[960px]">
        {/* Left panel: Pending orders */}
        <div className="w-72 shrink-0 border-r flex flex-col h-full bg-background">
          <div className="sticky top-0 bg-background border-b px-3 py-2 z-10">
            <p className="text-sm font-semibold">
              {t("inventory.dispatch.pending_orders")} ({pendingCount})
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <DispatchSmartSuggestions
              pendingOrders={pendingOrders}
              onSelectOrders={handleSuggestionSelect}
              onDismiss={() => setSuggestionsVisible(false)}
              visible={suggestionsVisible}
            />
            {pendingOrders.map((order) => (
              <PendingOrderCard
                key={order.id}
                order={order}
                isSelected={selectedPendingIds.has(String(order.id))}
                isHighlighted={highlightedOrderId === String(order.id)}
                onToggleSelect={handleTogglePendingSelect}
                onHighlight={handleHighlight}
                onAssign={handleAssignSingle}
              />
            ))}
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("inventory.dispatch.no_pending_orders")}
              </p>
            ) : null}
          </div>

          {/* Bulk action bar */}
          {selectedCount > 0 ? (
            <div className="border-t bg-background px-3 py-2 space-y-1.5 shrink-0">
              <p className="text-xs font-medium">
                {t("inventory.dispatch.assign_selected", {
                  count: selectedCount,
                })}
              </p>
              {selectedDispatchId && canAssignToSelected ? (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleBulkAssign}
                  disabled={addStopMutation.isPending}
                >
                  {t("inventory.dispatch.to_existing_dispatch")}
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={onCreateDispatch}
              >
                <Plus className="size-3.5" />
                {t("inventory.dispatch.to_new_dispatch")}
              </Button>
            </div>
          ) : null}
        </div>

        {/* Center: Map */}
        <div className="flex-1 relative z-0">
          <DispatchMapView
            orders={dispatchOrders}
            warehouses={warehouses}
            zones={zones}
            showSidebar={false}
            onOrderClick={onViewDispatchDetail}
          />
        </div>

        {/* Right panel: Dispatch detail (conditional) */}
        {selectedDispatchOrder ? (
          <div className="w-80 shrink-0 border-l overflow-y-auto h-full bg-background">
            <DispatchCommandDetailPanel
              dispatchOrder={selectedDispatchOrder}
              onClose={handleCloseDetail}
            />
          </div>
        ) : null}
      </div>

      {/* Bottom bar: Dispatch orders */}
      <div className="border-t shrink-0 bg-background overflow-x-auto">
        <div className="flex items-center gap-2 px-3 py-1.5">
          {dispatchOrders.map((order) => (
            <DispatchBarCard
              key={order.id}
              order={order}
              isSelected={selectedDispatchId === String(order.id)}
              onClick={handleDispatchBarClick}
            />
          ))}
          {dispatchOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center w-full">
              {t("inventory.dispatch.no_dispatch_orders")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { DispatchCommandCenter };
