"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, List, MapPin, Truck } from "lucide-react";
import { MapView, type MapMarker, type MapPolygon, type MapPolyline } from "@/shared/components/map-view";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet";
import type { DispatchOrder, Warehouse, Zone } from "../types";
import {
  dispatchStatusColorMap,
  dispatchStatusTranslationMap,
  dispatchBorderColorMap,
  dispatchProgressColorMap,
  dispatchStopStatusTranslationMap,
} from "../constants";
import { DispatchCommandDetailPanel } from "./dispatch-command-detail-panel";

type DispatchMapViewProps = {
  orders: DispatchOrder[];
  warehouses?: Warehouse[];
  zones?: Zone[];
  /** Use h-full instead of h-[600px] to fill parent container. */
  fillHeight?: boolean;
  /** Called when a sidebar card is selected/deselected (for external panel integration). */
  onOrderSelect?: (orderId: string) => void;
  /** Called when "Ver detalle completo" is clicked in the inline detail panel. */
  onViewOrderDetail?: (order: DispatchOrder) => void;
  /** Called when "Editar" is clicked in the inline detail panel. */
  onEditOrder?: (order: DispatchOrder) => void;
  /** Called when "Despachar" is clicked in the inline detail panel. */
  onDispatchOrder?: (order: DispatchOrder) => void;
  /** Called when "Cancelar" is clicked in the inline detail panel. */
  onCancelOrder?: (order: DispatchOrder) => void;
  /** Called when "Agregar parada" is clicked in the inline detail panel. */
  onAddStop?: (order: DispatchOrder) => void;
};


function MapLegend({ t, defaultCollapsed = false }: { t: ReturnType<typeof useAppTranslator>["t"]; defaultCollapsed?: boolean }) {
  const [open, setOpen] = useState(!defaultCollapsed);

  const LEGEND_ITEMS = [
    { color: "#eab308", label: t("inventory.dispatch.legend_pending") },
    { color: "#f97316", label: t("inventory.dispatch.legend_in_transit") },
    { color: "#22c55e", label: t("inventory.dispatch.legend_delivered") },
    { color: "#ef4444", label: t("inventory.dispatch.legend_failed") },
    { color: "#6b7280", label: t("inventory.dispatch.legend_skipped") },
    { color: "#16a34a", label: t("inventory.dispatch.legend_warehouse"), shape: "square" as const },
    { color: "#6366f1", label: t("inventory.dispatch.legend_zone"), shape: "area" as const },
  ];

  return (
    <div className="absolute bottom-3 right-3 z-10 bg-background/95 backdrop-blur-sm rounded-lg border shadow-sm text-xs max-w-[180px]">
      <button
        type="button"
        className="flex items-center justify-between w-full px-2.5 py-1.5 font-medium"
        onClick={() => setOpen(!open)}
      >
        {t("inventory.dispatch.legend")}
        {open ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
      </button>
      {open ? (
        <div className="px-2.5 pb-2 space-y-1">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              {item.shape === "area" ? (
                <div
                  className="size-3.5 rounded-sm border"
                  style={{ backgroundColor: `${item.color}20`, borderColor: item.color }}
                />
              ) : item.shape === "square" ? (
                <div
                  className="size-3.5 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
              ) : (
                <div
                  className="size-3.5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DispatchMapView({ orders, warehouses = [], zones = [], fillHeight = false, onOrderSelect, onViewOrderDetail, onEditOrder, onDispatchOrder, onCancelOrder, onAddStop }: DispatchMapViewProps) {
  const { t } = useAppTranslator();
  const isMobile = useIsMobile();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const selectedOrder = useMemo(
    () => orders.find((o) => String(o.id) === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  // Build markers from all stops with coordinates
  const markers = useMemo<MapMarker[]>(() => {
    const result: MapMarker[] = [];
    for (const order of orders) {
      for (const stop of order.stops ?? []) {
        if (stop.delivery_latitude && stop.delivery_longitude) {
          result.push({
            id: `${order.id}-${stop.id}`,
            lat: stop.delivery_latitude,
            lng: stop.delivery_longitude,
            status: stop.status,
            popup: `<strong>${order.code ?? `DO-${order.id}`}</strong><br/>
              ${stop.sale_order?.code ?? ""} — ${stop.customer_contact?.name ?? ""}<br/>
              <em>${t(dispatchStopStatusTranslationMap[stop.status] ?? "inventory.dispatch.stop_pending")}</em>`,
          });
        }
      }
    }
    return result;
  }, [orders, t]);

  // Build polyline for selected order (connect its stops in sequence)
  const polylines = useMemo<MapPolyline[]>(() => {
    if (!selectedOrder) return [];
    const stops = (selectedOrder.stops ?? [])
      .filter((s) => s.delivery_latitude && s.delivery_longitude)
      .sort((a, b) => a.delivery_sequence - b.delivery_sequence);

    const stopPoints = stops.map((s) => [s.delivery_latitude!, s.delivery_longitude!] as [number, number]);

    // Prepend warehouse origin if available
    const warehouseId = selectedOrder.origin_warehouse_id ?? selectedOrder.origin_warehouse?.id;
    if (warehouseId) {
      const wh = warehouses.find((w) => String(w.id) === String(warehouseId));
      if (wh && wh.latitude && wh.longitude) {
        stopPoints.unshift([wh.latitude, wh.longitude]);
      }
    }

    if (stopPoints.length < 2) return [];

    return [
      {
        id: `route-${selectedOrder.id}`,
        points: stopPoints,
        color: "#3b82f6",
        weight: 3,
      },
    ];
  }, [selectedOrder, warehouses]);

  // Build warehouse markers (always visible for warehouses with coordinates)
  const warehouseMarkers = useMemo<MapMarker[]>(() => {
    return warehouses
      .filter((w) => w.latitude && w.longitude)
      .map((w) => ({
        id: `warehouse-${w.id}`,
        lat: w.latitude!,
        lng: w.longitude!,
        color: "#16a34a",
        popup: `<strong>${t("inventory.dispatch.legend_warehouse")}: ${w.name}</strong>`,
      }));
  }, [warehouses, t]);

  // Filter markers to highlight selected order
  const visibleMarkers = useMemo(() => {
    return [...markers, ...warehouseMarkers];
  }, [markers, warehouseMarkers]);

  const selectedMarkerIds = useMemo(() => {
    if (!selectedOrder) return new Set<string>();
    return new Set((selectedOrder.stops ?? []).map((s) => `${selectedOrder.id}-${s.id}`));
  }, [selectedOrder]);

  // Build zone polygons
  const zonePolygons = useMemo<MapPolygon[]>(() => {
    return zones
      .filter((z) => z.boundary && z.boundary.length >= 3)
      .map((z) => ({
        id: `zone-${z.id}`,
        points: z.boundary as [number, number][],
        color: "#6366f1",
        fillColor: "#6366f1",
        fillOpacity: 0.08,
        label: z.name,
      }));
  }, [zones]);

  function handleOrderSelect(orderId: string) {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
    if (isMobile) setMobileListOpen(false);
  }

  // Filter active orders for the list (exclude cancelled)
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "cancelled"),
    [orders],
  );

  const orderListContent = (
    <>
      <div className="sticky top-0 bg-background border-b px-3 py-2">
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
          const progressPercent = totalStops > 0 ? (deliveredCount / totalStops) * 100 : 0;

          const whId = order.origin_warehouse_id ?? order.origin_warehouse?.id;
          const whHasCoords = whId
            ? Boolean(warehouses.find((w) => String(w.id) === String(whId))?.latitude)
            : false;

          return (
            <div
              key={order.id}
              role="button"
              tabIndex={0}
              className={`border-l-4 ${dispatchBorderColorMap[order.status] ?? "border-l-gray-400"} rounded-md border p-2.5 transition-colors cursor-pointer ${
                isSelected ? "bg-accent" : "hover:bg-muted/40"
              }`}
              onClick={() => {
                handleOrderSelect(String(order.id));
                if (onOrderSelect) onOrderSelect(String(order.id));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOrderSelect(String(order.id));
                  if (onOrderSelect) onOrderSelect(String(order.id));
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
                  {t(dispatchStatusTranslationMap[order.status] ?? "inventory.dispatch.status_draft")}
                </span>
              </div>

              <div className="text-xs text-muted-foreground space-y-0.5">
                {order.vehicle ? (
                  <p className="flex items-center gap-1">
                    <Truck className="size-3 shrink-0" />
                    <span className="truncate">{order.vehicle.plate_number}</span>
                    {order.driver_user ? (
                      <span className="truncate">· {order.driver_user.name}</span>
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
                      ({totalStops - stopsWithCoords} {t("inventory.dispatch.stops_no_location")})
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

  const detailPanelContent = selectedOrder ? (
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

  return (
    <div className={`relative ${fillHeight ? "h-full" : ""}`}>
    <div className={`flex ${fillHeight ? "h-full" : "h-[600px]"} rounded-lg border overflow-hidden relative z-0`}>
      {/* Left: Order list — inline on desktop, Sheet on mobile */}
      {isMobile ? (
        <Sheet open={mobileListOpen} onOpenChange={setMobileListOpen}>
          <SheetContent side="left" className="p-0 overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>{t("inventory.entity.dispatch_orders")}</SheetTitle>
            </SheetHeader>
            <SheetBody className="p-0">
              {orderListContent}
            </SheetBody>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-80 shrink-0 border-r overflow-y-auto bg-background">
          {orderListContent}
        </div>
      )}

      {/* Detail panel — inline on desktop, Sheet on mobile */}
      {isMobile ? (
        <Sheet open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrderId(null); }}>
          <SheetContent side="right" className="p-0 overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>{selectedOrder?.code ?? t("inventory.entity.dispatch_order")}</SheetTitle>
            </SheetHeader>
            <SheetBody className="p-0">
              {detailPanelContent}
            </SheetBody>
          </SheetContent>
        </Sheet>
      ) : selectedOrder ? (
        <div className="w-80 shrink-0 border-l overflow-y-auto h-full bg-background">
          {detailPanelContent}
        </div>
      ) : null}

      {/* Map */}
      <div className="flex-1 relative">
        {isMobile ? (
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-10 left-3 z-10 shadow-md gap-1.5"
            onClick={() => setMobileListOpen(true)}
          >
            <List className="size-4" />
            {t("inventory.entity.dispatch_orders")} ({activeOrders.length})
          </Button>
        ) : null}
        <MapView
          markers={visibleMarkers.map((m) => ({
            ...m,
            opacity: m.id.startsWith("warehouse-")
              ? 1
              : selectedOrderId && !selectedMarkerIds.has(m.id) ? 0.3 : 1,
          }))}
          polylines={polylines}
          polygons={zonePolygons}
          selectedMarkerId={null}
          className="h-full rounded-none"
        />
        {markers.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/60 pointer-events-none">
            <div className="text-center">
              <MapPin className="size-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                {t("inventory.dispatch.no_locations")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("inventory.dispatch.no_locations_hint")}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
    <MapLegend t={t} defaultCollapsed={isMobile} />
    </div>
  );
}

export { DispatchMapView };
