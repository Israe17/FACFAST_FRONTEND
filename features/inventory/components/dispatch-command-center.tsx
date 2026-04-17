"use client";

import { useCallback, useMemo, useState } from "react";
import { Package, Plus, Truck, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useIsMobile } from "@/shared/hooks/use-mobile";

import type { SaleOrder } from "@/features/sales/types";

import { useAddDispatchStopMutation } from "../queries";
import type { DispatchOrder, Warehouse, Zone } from "../types";
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
  onEditDispatch: (order: DispatchOrder) => void;
  onDispatchDispatch: (order: DispatchOrder) => void;
  onCancelDispatch: (order: DispatchOrder) => void;
  onAddStop: (order: DispatchOrder) => void;
};

function DispatchCommandCenter({
  pendingOrders,
  dispatchOrders,
  warehouses,
  zones,
  onCreateDispatch,
  onViewDispatchDetail,
  onEditDispatch,
  onDispatchDispatch,
  onCancelDispatch,
  onAddStop,
}: DispatchCommandCenterProps) {
  const { t } = useAppTranslator();
  const isMobile = useIsMobile();

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
  const [mobilePendingOpen, setMobilePendingOpen] = useState(false);

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

  const handleSuggestionSelect = useCallback((orderIds: string[]) => {
    setSelectedPendingIds(new Set(orderIds));
    setSuggestionsVisible(false);
  }, []);

  const pendingPanelContent = (
    <div className="flex flex-col h-full">
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
  );

  return (
    <div className="relative flex flex-col h-[calc(100vh-220px)]">
      {/* Top KPIs bar */}
      <div className="flex items-center gap-3 md:gap-6 border-b px-4 py-2.5 shrink-0 bg-background overflow-x-auto md:overflow-visible">
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Package className="size-4 text-orange-500" />
          <span className="text-xs md:text-sm text-muted-foreground">
            {t("inventory.dispatch.pending_orders")}
          </span>
          <span className="text-xs md:text-sm font-semibold tabular-nums">
            {pendingCount}
          </span>
        </div>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Truck className="size-4 text-indigo-500" />
          <span className="text-xs md:text-sm text-muted-foreground">
            {t("inventory.dispatch.in_route")}
          </span>
          <span className="text-xs md:text-sm font-semibold tabular-nums">
            {inRouteCount}
          </span>
        </div>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <CheckCircle2 className="size-4 text-green-500" />
          <span className="text-xs md:text-sm text-muted-foreground">
            {t("inventory.dispatch.completed")}
          </span>
          <span className="text-xs md:text-sm font-semibold tabular-nums">
            {completedCount}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Left panel: Pending orders — inline on desktop, Sheet on mobile */}
        {isMobile ? (
          <Sheet open={mobilePendingOpen} onOpenChange={setMobilePendingOpen}>
            <SheetContent side="left" className="p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>{t("inventory.dispatch.pending_orders")}</SheetTitle>
              </SheetHeader>
              <SheetBody className="p-0">
                {pendingPanelContent}
              </SheetBody>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="w-72 shrink-0 border-r flex flex-col h-full bg-background">
            {pendingPanelContent}
          </div>
        )}

        {/* Center: Map with sidebar + inline detail panel */}
        <div className="flex-1 min-w-0 relative z-0 overflow-hidden">
          <DispatchMapView
            orders={dispatchOrders}
            warehouses={warehouses}
            zones={zones}
            fillHeight
            onOrderSelect={handleDispatchBarClick}
            onViewOrderDetail={onViewDispatchDetail}
            onEditOrder={onEditDispatch}
            onDispatchOrder={onDispatchDispatch}
            onCancelOrder={onCancelDispatch}
            onAddStop={onAddStop}
          />
        </div>
      </div>
      {isMobile && pendingCount > 0 ? (
        <button
          type="button"
          className="absolute top-14 right-3 z-10 flex items-center gap-1 rounded-full bg-orange-500 text-white px-2.5 py-1 shadow-lg text-xs font-medium active:scale-95 transition-transform"
          onClick={() => setMobilePendingOpen(true)}
        >
          <Package className="size-3" />
          {pendingCount}
        </button>
      ) : null}
    </div>
  );
}

export { DispatchCommandCenter };
