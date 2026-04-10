"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { MapMarker, MapPolygon, MapPolyline } from "./map-view-types";

export type { MapMarker, MapPolygon, MapPolyline };

declare global {
  interface Window {
    L: any;
  }
}

const STOP_STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  in_transit: "#f97316",
  delivered: "#22c55e",
  failed: "#ef4444",
  partial: "#f97316",
  skipped: "#6b7280",
};

type MapViewInnerProps = {
  markers?: MapMarker[];
  polylines?: MapPolyline[];
  polygons?: MapPolygon[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  selectedMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
  onClick?: (lat: number, lng: number) => void;
};

const DEFAULT_CENTER: [number, number] = [9.9281, -84.0907];
const DEFAULT_ZOOM = 8;

function waitForLeaflet(): Promise<any> {
  return new Promise((resolve) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    const interval = setInterval(() => {
      if (window.L) {
        clearInterval(interval);
        resolve(window.L);
      }
    }, 50);
  });
}

function MapViewInner({
  markers = [],
  polylines = [],
  polygons = [],
  center,
  zoom,
  className = "",
  selectedMarkerId,
  onMarkerClick,
  onClick,
}: MapViewInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const polylinesLayerRef = useRef<any>(null);
  const polygonsLayerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // Initialize map once Leaflet is loaded from CDN
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    waitForLeaflet().then((L) => {
      if (cancelled || !containerRef.current) return;

      LRef.current = L;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current).setView(
        center ?? DEFAULT_CENTER,
        zoom ?? DEFAULT_ZOOM,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      polylinesLayerRef.current = L.layerGroup().addTo(map);
      polygonsLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Invalidate size when container resizes (e.g. after Sheet open/close)
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [ready]);

  // Handle map click events
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onClick) return;

    const handler = (e: any) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [onClick, ready]);

  // Update markers
  useEffect(() => {
    const L = LRef.current;
    const layer = markersLayerRef.current;
    if (!L || !layer) return;

    layer.clearLayers();

    for (const m of markers) {
      const color =
        m.color ?? STOP_STATUS_COLORS[m.status ?? ""] ?? "#3b82f6";
      const isSelected = m.id === selectedMarkerId;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width: ${isSelected ? 32 : 24}px; height: ${isSelected ? 32 : 24}px; border-radius: 50%;
          background: ${color}; border: ${isSelected ? "4px solid #1d4ed8" : "3px solid white"};
          box-shadow: ${isSelected ? "0 0 0 3px rgba(59,130,246,0.4), 0 2px 8px rgba(0,0,0,0.4)" : "0 2px 6px rgba(0,0,0,0.3)"};
        "></div>`,
        iconSize: isSelected ? [32, 32] : [24, 24],
        iconAnchor: isSelected ? [16, 16] : [12, 12],
        popupAnchor: [0, isSelected ? -18 : -14],
      });

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(layer);

      if (m.popup) {
        marker.bindPopup(typeof m.popup === "string" ? m.popup : "");
      }

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(m.id));
      }
    }
  }, [markers, selectedMarkerId, onMarkerClick, ready]);

  // Update polylines
  useEffect(() => {
    const L = LRef.current;
    const layer = polylinesLayerRef.current;
    if (!L || !layer) return;

    layer.clearLayers();

    for (const p of polylines) {
      L.polyline(p.points, {
        color: p.color ?? "#3b82f6",
        weight: p.weight ?? 3,
        dashArray: p.dashArray,
        opacity: 0.7,
      }).addTo(layer);
    }
  }, [polylines, ready]);

  // Update polygons (zone boundaries)
  useEffect(() => {
    const L = LRef.current;
    const layer = polygonsLayerRef.current;
    if (!L || !layer) return;

    layer.clearLayers();

    for (const p of polygons) {
      const polygon = L.polygon(p.points, {
        color: p.color ?? "#6366f1",
        fillColor: p.fillColor ?? p.color ?? "#6366f1",
        fillOpacity: p.fillOpacity ?? 0.1,
        weight: 2,
      }).addTo(layer);

      if (p.label) {
        polygon.bindTooltip(p.label, {
          permanent: true,
          direction: "center",
          className: "zone-label",
        });
      }
    }
  }, [polygons, ready]);

  // Fit bounds when markers or polygons change
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const allPoints: [number, number][] = [];
    for (const m of markers) {
      allPoints.push([m.lat, m.lng]);
    }
    for (const p of polygons) {
      for (const pt of p.points) {
        allPoints.push(pt);
      }
    }

    if (allPoints.length === 0) return;

    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [markers, polygons, ready]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[400px] rounded-lg ${className}`}
    />
  );
}

export { MapViewInner };
