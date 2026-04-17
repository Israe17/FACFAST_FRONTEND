"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { MapView, type MapMarker, type MapPolygon, type MapPolyline } from "@/shared/components/map-view";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { DispatchOrder, Warehouse, Zone } from "../types";
import { dispatchStopStatusTranslationMap } from "../constants";

type DispatchMapProps = {
  orders: DispatchOrder[];
  warehouses?: Warehouse[];
  zones?: Zone[];
  selectedOrderId?: string | null;
  className?: string;
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
                <div className="size-3.5 rounded-sm border" style={{ backgroundColor: `${item.color}20`, borderColor: item.color }} />
              ) : item.shape === "square" ? (
                <div className="size-3.5 rounded-sm" style={{ backgroundColor: item.color }} />
              ) : (
                <div className="size-3.5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.color }} />
              )}
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DispatchMap({ orders, warehouses = [], zones = [], selectedOrderId = null, className }: DispatchMapProps) {
  const { t } = useAppTranslator();

  const selectedOrder = useMemo(
    () => (selectedOrderId ? orders.find((o) => String(o.id) === selectedOrderId) ?? null : null),
    [orders, selectedOrderId],
  );

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

  const polylines = useMemo<MapPolyline[]>(() => {
    if (!selectedOrder) return [];
    const stops = (selectedOrder.stops ?? [])
      .filter((s) => s.delivery_latitude && s.delivery_longitude)
      .sort((a, b) => a.delivery_sequence - b.delivery_sequence);
    const stopPoints = stops.map((s) => [s.delivery_latitude!, s.delivery_longitude!] as [number, number]);
    const warehouseId = selectedOrder.origin_warehouse_id ?? selectedOrder.origin_warehouse?.id;
    if (warehouseId) {
      const wh = warehouses.find((w) => String(w.id) === String(warehouseId));
      if (wh?.latitude && wh?.longitude) stopPoints.unshift([wh.latitude, wh.longitude]);
    }
    if (stopPoints.length < 2) return [];
    return [{ id: `route-${selectedOrder.id}`, points: stopPoints, color: "#3b82f6", weight: 3 }];
  }, [selectedOrder, warehouses]);

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

  const visibleMarkers = useMemo(() => [...markers, ...warehouseMarkers], [markers, warehouseMarkers]);

  const selectedMarkerIds = useMemo(() => {
    if (!selectedOrder) return new Set<string>();
    return new Set((selectedOrder.stops ?? []).map((s) => `${selectedOrder.id}-${s.id}`));
  }, [selectedOrder]);

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

  return (
    <div className={`relative h-full ${className ?? ""}`}>
      <div className="h-full relative z-0">
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
      <MapLegend t={t} />
    </div>
  );
}

export { DispatchMap };
