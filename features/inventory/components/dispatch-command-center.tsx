"use client";

import { useCallback, useMemo, useState } from "react";
import { Package, Plus, Search, Truck, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CollapsibleMobilePanel } from "./collapsible-mobile-panel";
import { DispatchCommandDetailPanel } from "./dispatch-command-detail-panel";
import { DispatchMap } from "./dispatch-map";
import { DispatchOrderListPanel } from "./dispatch-order-list-panel";
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

  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(null);
  const [selectedPendingIds, setSelectedPendingIds] = useState<Set<string>>(new Set());
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingDateFilter, setPendingDateFilter] = useState("");

  const addStopMutation = useAddDispatchStopMutation(selectedDispatchId ?? "", { showErrorToast: true });

  const pendingCount = pendingOrders.length;
  const inRouteCount = useMemo(
    () => dispatchOrders.filter((o) => o.status === "dispatched" || o.status === "in_transit").length,
    [dispatchOrders],
  );
  const completedCount = useMemo(
    () => dispatchOrders.filter((o) => o.status === "completed").length,
    [dispatchOrders],
  );
  const activeCount = useMemo(
    () => dispatchOrders.filter((o) => o.status !== "cancelled").length,
    [dispatchOrders],
  );

  const selectedDispatchOrder = useMemo(
    () => dispatchOrders.find((o) => String(o.id) === selectedDispatchId) ?? null,
    [dispatchOrders, selectedDispatchId],
  );

  const selectedCount = selectedPendingIds.size;

  const canAssignToSelected = useMemo(() => {
    if (!selectedDispatchOrder) return false;
    if (!selectedDispatchOrder.lifecycle?.can_edit) return false;
    if (selectedDispatchOrder.dispatch_type === "individual" && (selectedDispatchOrder.stops ?? []).length > 0) return false;
    return true;
  }, [selectedDispatchOrder]);

  const handleTogglePendingSelect = useCallback((orderId: string) => {
    setSelectedPendingIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
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
        await addStopMutation.mutateAsync({ sale_order_id: orderId, delivery_sequence: nextSeq });
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
      await addStopMutation.mutateAsync({ sale_order_id: saleOrderId, delivery_sequence: seq++ });
    }
    setSelectedPendingIds(new Set());
  }, [selectedDispatchId, selectedCount, selectedPendingIds, selectedDispatchOrder, addStopMutation]);

  const handleDispatchOrderSelect = useCallback((orderId: string) => {
    setSelectedDispatchId((prev) => (prev === orderId ? null : orderId));
  }, []);

  const handleSuggestionSelect = useCallback((orderIds: string[]) => {
    setSelectedPendingIds(new Set(orderIds));
    setSuggestionsVisible(false);
  }, []);

  const filteredPending = useMemo(() => {
    let result = pendingOrders;
    if (pendingSearch) {
      const q = pendingSearch.toLowerCase();
      result = result.filter(
        (o) =>
          o.code?.toLowerCase().includes(q) ||
          o.customer_contact?.name?.toLowerCase().includes(q) ||
          o.delivery_address?.toLowerCase().includes(q) ||
          o.delivery_zone?.name?.toLowerCase().includes(q),
      );
    }
    if (pendingDateFilter) {
      result = result.filter((o) => {
        if (!o.delivery_requested_date) return false;
        return o.delivery_requested_date.substring(0, 10) === pendingDateFilter;
      });
    }
    return result;
  }, [pendingOrders, pendingSearch, pendingDateFilter]);

  // --- Pending orders panel content ---
  const pendingContent = (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 bg-background border-b px-3 py-2 z-10 space-y-2">
        <p className="text-sm font-semibold">
          {t("inventory.dispatch.pending_orders")} ({filteredPending.length})
        </p>
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              className="h-7 text-xs pl-7"
              placeholder={t("common.table.search_placeholder")}
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
            />
          </div>
          <Input
            type="date"
            className="h-7 text-xs w-[120px] shrink-0"
            value={pendingDateFilter}
            onChange={(e) => setPendingDateFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <DispatchSmartSuggestions
          pendingOrders={pendingOrders}
          onSelectOrders={handleSuggestionSelect}
          onDismiss={() => setSuggestionsVisible(false)}
          visible={suggestionsVisible}
        />
        {filteredPending.map((order) => (
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
        {filteredPending.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("inventory.dispatch.no_pending_orders")}
          </p>
        ) : null}
      </div>
      {selectedCount > 0 ? (
        <div className="border-t bg-background px-3 py-2 space-y-1.5 shrink-0">
          <p className="text-xs font-medium">
            {t("inventory.dispatch.assign_selected", { count: selectedCount })}
          </p>
          {selectedDispatchId && canAssignToSelected ? (
            <Button size="sm" className="w-full" onClick={handleBulkAssign} disabled={addStopMutation.isPending}>
              {t("inventory.dispatch.to_existing_dispatch")}
            </Button>
          ) : null}
          <Button size="sm" variant="outline" className="w-full" onClick={onCreateDispatch}>
            <Plus className="size-3.5" />
            {t("inventory.dispatch.to_new_dispatch")}
          </Button>
        </div>
      ) : null}
    </div>
  );

  // --- Detail panel ---
  const detailPanel = selectedDispatchOrder ? (
    <DispatchCommandDetailPanel
      dispatchOrder={selectedDispatchOrder}
      onClose={() => setSelectedDispatchId(null)}
      onViewFullDetail={() => onViewDispatchDetail(selectedDispatchOrder)}
      onEdit={() => onEditDispatch(selectedDispatchOrder)}
      onDispatch={() => onDispatchDispatch(selectedDispatchOrder)}
      onCancel={() => onCancelDispatch(selectedDispatchOrder)}
      onAddStop={() => onAddStop(selectedDispatchOrder)}
    />
  ) : null;

  // --- Mobile layout ---
  if (isMobile) {
    return (
      <div className="relative flex flex-col h-[calc(100vh-220px)]">
        {/* KPI bar */}
        <div className="flex items-center gap-3 border-b px-4 py-2.5 shrink-0 bg-background overflow-x-auto">
          <div className="flex items-center gap-1 shrink-0">
            <Package className="size-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">{t("inventory.dispatch.pending_orders")}</span>
            <span className="text-xs font-semibold tabular-nums">{pendingCount}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Truck className="size-4 text-indigo-500" />
            <span className="text-xs text-muted-foreground">{t("inventory.dispatch.in_route")}</span>
            <span className="text-xs font-semibold tabular-nums">{inRouteCount}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <CheckCircle2 className="size-4 text-green-500" />
            <span className="text-xs text-muted-foreground">{t("inventory.dispatch.completed")}</span>
            <span className="text-xs font-semibold tabular-nums">{completedCount}</span>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-0 relative">
          <DispatchMap
            orders={dispatchOrders}
            warehouses={warehouses}
            zones={zones}
            selectedOrderId={selectedDispatchId}
          />

          {/* Bottom: dispatch orders collapsible */}
          <CollapsibleMobilePanel
            title={t("inventory.entity.dispatch_orders")}
            count={activeCount}
            icon={<Truck className="size-4 text-primary" />}
            position="bottom"
          >
            <DispatchOrderListPanel
              orders={dispatchOrders}
              warehouses={warehouses}
              selectedOrderId={selectedDispatchId}
              onOrderSelect={handleDispatchOrderSelect}
            />
          </CollapsibleMobilePanel>
        </div>

        {/* Pending orders bottom sheet */}
        {pendingCount > 0 ? (
          <CollapsibleMobilePanel
            title={t("inventory.dispatch.pending_orders")}
            count={pendingCount}
            icon={<Package className="size-4 text-orange-500" />}
            countColor="bg-orange-500 text-white"
            position="top"
            maxHeight="40vh"
          >
            {pendingContent}
          </CollapsibleMobilePanel>
        ) : null}

        {/* Detail bottom sheet */}
        <Sheet open={!!selectedDispatchOrder} onOpenChange={(open) => { if (!open) setSelectedDispatchId(null); }}>
          <SheetContent side="bottom" className="p-0 h-[60vh] flex flex-col rounded-t-xl">
            <SheetHeader className="px-4 pt-3 pb-2 border-b shrink-0">
              <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
              <SheetTitle className="text-sm font-semibold">
                {selectedDispatchOrder?.code ?? t("inventory.entity.dispatch_order")}
              </SheetTitle>
            </SheetHeader>
            <SheetBody className="p-0 flex-1 overflow-y-auto">
              {detailPanel}
            </SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // --- Desktop layout ---
  return (
    <div className="relative flex flex-col h-[calc(100vh-220px)]">
      {/* KPI bar */}
      <div className="flex items-center gap-6 border-b px-4 py-2.5 shrink-0 bg-background">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-orange-500" />
          <span className="text-sm text-muted-foreground">{t("inventory.dispatch.pending_orders")}</span>
          <span className="text-sm font-semibold tabular-nums">{pendingCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-indigo-500" />
          <span className="text-sm text-muted-foreground">{t("inventory.dispatch.in_route")}</span>
          <span className="text-sm font-semibold tabular-nums">{inRouteCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-green-500" />
          <span className="text-sm text-muted-foreground">{t("inventory.dispatch.completed")}</span>
          <span className="text-sm font-semibold tabular-nums">{completedCount}</span>
        </div>
      </div>

      {/* 4-panel layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Pending orders */}
        <div className="w-72 shrink-0 border-r flex flex-col h-full bg-background">
          {pendingContent}
        </div>

        {/* Dispatch order list */}
        <div className="w-80 shrink-0 border-r overflow-y-auto bg-background">
          <DispatchOrderListPanel
            orders={dispatchOrders}
            warehouses={warehouses}
            selectedOrderId={selectedDispatchId}
            onOrderSelect={handleDispatchOrderSelect}
          />
        </div>

        {/* Map */}
        <div className="flex-1 min-w-0 relative z-0">
          <DispatchMap
            orders={dispatchOrders}
            warehouses={warehouses}
            zones={zones}
            selectedOrderId={selectedDispatchId}
          />
        </div>

        {/* Detail panel */}
        {selectedDispatchOrder ? (
          <div className="w-80 shrink-0 border-l overflow-y-auto h-full bg-background">
            {detailPanel}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { DispatchCommandCenter };
