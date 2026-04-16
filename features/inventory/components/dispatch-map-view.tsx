"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Truck } from "lucide-react";
import { MapView, type MapMarker, type MapPolygon, type MapPolyline } from "@/shared/components/map-view";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import type { FrontendTranslationKey } from "@/shared/i18n/translations";

import type { DispatchOrder, DispatchStop, Warehouse, Zone } from "../types";

type DispatchMapViewProps = {
  orders: DispatchOrder[];
  warehouses?: Warehouse[];
  zones?: Zone[];
  refreshKey?: number;
  /** Hide the built-in order list sidebar (default true). Set to false when the parent already provides its own panel. */
  showSidebar?: boolean;
  onOrderClick?: (order: DispatchOrder) => void;
};

const statusColorMap: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  ready: "bg-blue-100 text-blue-800",
  dispatched: "bg-indigo-100 text-indigo-800",
  in_transit: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusTranslationMap: Record<string, FrontendTranslationKey> = {
  draft: "inventory.dispatch.status_draft",
  ready: "inventory.dispatch.status_ready",
  dispatched: "inventory.dispatch.status_dispatched",
  in_transit: "inventory.dispatch.status_in_transit",
  completed: "inventory.dispatch.status_completed",
  cancelled: "inventory.dispatch.status_cancelled",
};

const stopStatusTranslationMap: Record<string, FrontendTranslationKey> = {
  pending: "inventory.dispatch.stop_pending",
  in_transit: "inventory.dispatch.stop_in_transit",
  delivered: "inventory.dispatch.stop_delivered",
  failed: "inventory.dispatch.stop_failed",
  partial: "inventory.dispatch.stop_partial",
  skipped: "inventory.dispatch.stop_skipped",
};

function MapLegend({ t }: { t: ReturnType<typeof useAppTranslator>["t"] }) {
  const [open, setOpen] = useState(true);

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

function DispatchMapView({ orders, warehouses = [], zones = [], refreshKey, onOrderClick }: DispatchMapViewProps) {
  const { t } = useAppTranslator();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
              <em>${t(stopStatusTranslationMap[stop.status] ?? "inventory.dispatch.stop_pending")}</em>`,
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
        popup: `<strong>Bodega: ${w.name}</strong>`,
      }));
  }, [warehouses]);

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
  }

  // Filter active orders for the list (non-cancelled, non-completed)
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "cancelled"),
    [orders],
  );

  return (
    <div className="relative">
    <div className="flex h-[600px] rounded-lg border overflow-hidden relative z-0">
      {/* Left: Order list */}
      <div className="w-80 shrink-0 border-r overflow-y-auto bg-background">
        <div className="sticky top-0 bg-background border-b px-3 py-2">
          <p className="text-sm font-semibold flex items-center gap-1.5">
            <Truck className="size-4" />
            {t("inventory.entity.dispatch_orders")} ({activeOrders.length})
          </p>
        </div>
        <div className="divide-y">
          {activeOrders.map((order) => {
            const isSelected = String(order.id) === selectedOrderId;
            const stopsWithCoords = (order.stops ?? []).filter(
              (s) => s.delivery_latitude && s.delivery_longitude,
            ).length;
            const totalStops = (order.stops ?? []).length;

            const whId = order.origin_warehouse_id ?? order.origin_warehouse?.id;
            const whHasCoords = whId
              ? Boolean(warehouses.find((w) => String(w.id) === String(whId))?.latitude)
              : false;

            return (
              <div
                key={order.id}
                role="button"
                tabIndex={0}
                className={`w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer ${isSelected ? "bg-muted" : ""}`}
                onClick={() => {
                  handleOrderSelect(String(order.id));
                  if (onOrderClick) onOrderClick(order);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    {order.code ?? `DO-${order.id}`}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColorMap[order.status] ?? ""}`}
                  >
                    {t(statusTranslationMap[order.status] ?? "inventory.dispatch.status_draft")}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {order.route ? (
                    <p>{order.route.name}</p>
                  ) : null}
                  {order.driver_user ? (
                    <p>{order.driver_user.name}</p>
                  ) : null}
                  <p className="flex items-center gap-1">
                    <MapPin className="size-3" />
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
              </div>
            );
          })}
          {activeOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Sin órdenes de despacho
            </p>
          ) : null}
        </div>
      </div>

      {/* Right: Map */}
      <div className="flex-1 relative">
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
    <MapLegend t={t} />
    </div>
  );
}

export { DispatchMapView };
