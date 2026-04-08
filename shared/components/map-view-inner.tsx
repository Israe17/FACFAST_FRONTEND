"use client";

import { useEffect, useRef, type ReactNode } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet's default icons break with bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STOP_STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",     // yellow
  in_transit: "#f97316",  // orange
  delivered: "#22c55e",   // green
  failed: "#ef4444",      // red
  partial: "#f97316",     // orange
  skipped: "#6b7280",     // gray
};

function createColorIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  status?: string;
  popup?: string | ReactNode;
  color?: string;
};

export type MapPolyline = {
  id: string;
  points: [number, number][];
  color?: string;
  weight?: number;
  dashArray?: string;
};

type MapViewInnerProps = {
  markers?: MapMarker[];
  polylines?: MapPolyline[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  selectedMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
};

// Costa Rica center
const DEFAULT_CENTER: [number, number] = [9.9281, -84.0907];
const DEFAULT_ZOOM = 8;

function MapViewInner({
  markers = [],
  polylines = [],
  center,
  zoom,
  className = "",
  selectedMarkerId,
  onMarkerClick,
}: MapViewInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(
      center ?? DEFAULT_CENTER,
      zoom ?? DEFAULT_ZOOM,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    polylinesLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    for (const m of markers) {
      const color = m.color ?? STOP_STATUS_COLORS[m.status ?? ""] ?? "#3b82f6";
      const isSelected = m.id === selectedMarkerId;

      const icon = isSelected
        ? L.divIcon({
            className: "",
            html: `<div style="
              width: 32px; height: 32px; border-radius: 50%;
              background: ${color}; border: 4px solid #1d4ed8;
              box-shadow: 0 0 0 3px rgba(59,130,246,0.4), 0 2px 8px rgba(0,0,0,0.4);
            "></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -18],
          })
        : createColorIcon(color);

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(layer);

      if (m.popup) {
        marker.bindPopup(typeof m.popup === "string" ? m.popup : "");
      }

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(m.id));
      }
    }
  }, [markers, selectedMarkerId, onMarkerClick]);

  // Update polylines
  useEffect(() => {
    const layer = polylinesLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    for (const p of polylines) {
      L.polyline(p.points, {
        color: p.color ?? "#3b82f6",
        weight: p.weight ?? 3,
        dashArray: p.dashArray,
        opacity: 0.7,
      }).addTo(layer);
    }
  }, [polylines]);

  // Fit bounds when markers change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || markers.length === 0) return;

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [markers]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[400px] rounded-lg ${className}`}
    />
  );
}

export { MapViewInner };
