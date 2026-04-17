"use client";

import { useMemo, useState } from "react";
import { Package, Truck } from "lucide-react";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet";

import type { DispatchOrder, Warehouse, Zone } from "../types";
import { CollapsibleMobilePanel } from "./collapsible-mobile-panel";
import { DispatchCommandDetailPanel } from "./dispatch-command-detail-panel";
import { DispatchMap } from "./dispatch-map";
import { DispatchOrderListPanel } from "./dispatch-order-list-panel";

type DispatchMapViewProps = {
  orders: DispatchOrder[];
  warehouses?: Warehouse[];
  zones?: Zone[];
  fillHeight?: boolean;
  onOrderSelect?: (orderId: string) => void;
  onViewOrderDetail?: (order: DispatchOrder) => void;
  onEditOrder?: (order: DispatchOrder) => void;
  onDispatchOrder?: (order: DispatchOrder) => void;
  onCancelOrder?: (order: DispatchOrder) => void;
  onAddStop?: (order: DispatchOrder) => void;
};

function DispatchMapView({
  orders,
  warehouses = [],
  zones = [],
  fillHeight = false,
  onOrderSelect,
  onViewOrderDetail,
  onEditOrder,
  onDispatchOrder,
  onCancelOrder,
  onAddStop,
}: DispatchMapViewProps) {
  const { t } = useAppTranslator();
  const isMobile = useIsMobile();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((o) => String(o.id) === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const activeCount = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").length,
    [orders],
  );

  function handleOrderSelect(orderId: string) {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
    if (onOrderSelect) onOrderSelect(orderId);
  }

  const detailPanel = selectedOrder ? (
    <DispatchCommandDetailPanel
      dispatchOrder={selectedOrder}
      onClose={() => setSelectedOrderId(null)}
      onViewFullDetail={onViewOrderDetail ? () => onViewOrderDetail(selectedOrder) : undefined}
      onEdit={onEditOrder ? () => onEditOrder(selectedOrder) : undefined}
      onDispatch={onDispatchOrder ? () => onDispatchOrder(selectedOrder) : undefined}
      onCancel={onCancelOrder ? () => onCancelOrder(selectedOrder) : undefined}
      onAddStop={onAddStop ? () => onAddStop(selectedOrder) : undefined}
    />
  ) : null;

  // --- Mobile layout ---
  if (isMobile) {
    return (
      <div className={`relative ${fillHeight ? "h-full" : "h-[600px]"}`}>
        <DispatchMap
          orders={orders}
          warehouses={warehouses}
          zones={zones}
          selectedOrderId={selectedOrderId}
        />

        <CollapsibleMobilePanel
          title={t("inventory.entity.dispatch_orders")}
          count={activeCount}
          icon={<Truck className="size-4 text-primary" />}
          position="bottom"
        >
          <DispatchOrderListPanel
            orders={orders}
            warehouses={warehouses}
            selectedOrderId={selectedOrderId}
            onOrderSelect={handleOrderSelect}
          />
        </CollapsibleMobilePanel>

        <Sheet open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrderId(null); }}>
          <SheetContent side="bottom" className="p-0 h-[60vh] flex flex-col rounded-t-xl">
            <SheetHeader className="px-4 pt-3 pb-2 border-b shrink-0">
              <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
              <SheetTitle className="text-sm font-semibold">
                {selectedOrder?.code ?? t("inventory.entity.dispatch_order")}
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
    <div className={`relative ${fillHeight ? "h-full" : ""}`}>
      <div className={`flex ${fillHeight ? "h-full" : "h-[600px]"} rounded-lg border overflow-hidden relative z-0`}>
        <div className="w-80 shrink-0 border-r overflow-y-auto bg-background">
          <DispatchOrderListPanel
            orders={orders}
            warehouses={warehouses}
            selectedOrderId={selectedOrderId}
            onOrderSelect={handleOrderSelect}
          />
        </div>

        {selectedOrder ? (
          <div className="w-80 shrink-0 border-l overflow-y-auto h-full bg-background">
            {detailPanel}
          </div>
        ) : null}

        <div className="flex-1">
          <DispatchMap
            orders={orders}
            warehouses={warehouses}
            zones={zones}
            selectedOrderId={selectedOrderId}
          />
        </div>
      </div>
    </div>
  );
}

export { DispatchMapView };
