"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Search, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    L: any;
  }
}

const DEFAULT_CENTER: [number, number] = [9.9281, -84.0907];
const DEFAULT_ZOOM = 8;
const ZONE_ZOOM = 12;

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type ZonePolygonEditorInnerProps = {
  boundary: [number, number][] | null;
  onChange: (boundary: [number, number][] | null, center: [number, number] | null) => void;
  disabled?: boolean;
};

function computeCentroid(points: [number, number][]): [number, number] {
  const n = points.length;
  if (n === 0) return DEFAULT_CENTER;
  const sum = points.reduce(
    (acc, p) => [acc[0] + p[0], acc[1] + p[1]],
    [0, 0],
  );
  return [sum[0] / n, sum[1] / n];
}

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

function ZonePolygonEditorInner({
  boundary,
  onChange,
  disabled,
}: ZonePolygonEditorInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const vertexMarkersRef = useRef<any[]>([]);
  const drawingPointsRef = useRef<[number, number][]>([]);
  const tempPolylineRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [pointCount, setPointCount] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    waitForLeaflet().then((L) => {
      if (cancelled || !containerRef.current) return;

      LRef.current = L;

      const initialCenter = boundary && boundary.length > 0
        ? computeCentroid(boundary)
        : DEFAULT_CENTER;
      const initialZoom = boundary && boundary.length > 0 ? ZONE_ZOOM : DEFAULT_ZOOM;

      const map = L.map(containerRef.current).setView(initialCenter, initialZoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

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

  // Draw existing boundary
  const drawBoundary = useCallback((points: [number, number][]) => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    // Clear existing
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    for (const m of vertexMarkersRef.current) {
      map.removeLayer(m);
    }
    vertexMarkersRef.current = [];

    if (points.length < 3) return;

    // Draw polygon
    const polygon = L.polygon(points, {
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);
    polygonLayerRef.current = polygon;

    // Draw draggable vertex markers
    points.forEach((point, index) => {
      const marker = L.circleMarker(point, {
        radius: 6,
        color: "#1d4ed8",
        fillColor: "#3b82f6",
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);

      if (!disabled) {
        marker.options.draggable = false; // circleMarker can't drag, use events instead
        marker.on("contextmenu", (e: any) => {
          e.originalEvent.preventDefault();
          // Remove vertex on right-click
          if (points.length <= 3) return; // need at least 3 points
          const newPoints = [...points];
          newPoints.splice(index, 1);
          onChange(newPoints, computeCentroid(newPoints));
        });
      }

      vertexMarkersRef.current.push(marker);
    });

    // Fit bounds
    map.fitBounds(polygon.getBounds(), { padding: [30, 30], maxZoom: 15 });
  }, [disabled, onChange]);

  // Render boundary when it changes
  useEffect(() => {
    if (!ready) return;
    drawBoundary(boundary ?? []);
  }, [boundary, ready, drawBoundary]);

  // Handle drawing mode clicks
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L || !drawing) return;

    const handleClick = (e: any) => {
      const point: [number, number] = [e.latlng.lat, e.latlng.lng];
      drawingPointsRef.current = [...drawingPointsRef.current, point];
      setPointCount(drawingPointsRef.current.length);

      // Draw temp polyline
      if (tempPolylineRef.current) {
        map.removeLayer(tempPolylineRef.current);
      }
      if (drawingPointsRef.current.length >= 2) {
        tempPolylineRef.current = L.polyline(drawingPointsRef.current, {
          color: "#3b82f6",
          weight: 2,
          dashArray: "5, 10",
        }).addTo(map);
      }

      // Add vertex marker
      L.circleMarker(point, {
        radius: 5,
        color: "#1d4ed8",
        fillColor: "#60a5fa",
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
    };

    map.on("click", handleClick);
    map.getContainer().style.cursor = "crosshair";

    return () => {
      map.off("click", handleClick);
      map.getContainer().style.cursor = "";
    };
  }, [drawing]);

  function handleStartDrawing() {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    // Clear existing boundary
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    for (const m of vertexMarkersRef.current) {
      map.removeLayer(m);
    }
    vertexMarkersRef.current = [];

    drawingPointsRef.current = [];
    setPointCount(0);
    setDrawing(true);
  }

  function handleFinishDrawing() {
    const points = drawingPointsRef.current;
    setDrawing(false);

    // Clean temp polyline
    if (tempPolylineRef.current && mapRef.current) {
      mapRef.current.removeLayer(tempPolylineRef.current);
      tempPolylineRef.current = null;
    }

    if (points.length >= 3) {
      onChange(points, computeCentroid(points));
    }
    drawingPointsRef.current = [];
    setPointCount(0);
  }

  function handleCancelDrawing() {
    const map = mapRef.current;
    setDrawing(false);

    if (tempPolylineRef.current && map) {
      map.removeLayer(tempPolylineRef.current);
      tempPolylineRef.current = null;
    }

    drawingPointsRef.current = [];
    setPointCount(0);

    // Redraw original boundary
    if (ready) drawBoundary(boundary ?? []);
  }

  function handleClear() {
    onChange(null, null);
  }

  // Search
  async function searchAddress(query: string) {
    if (query.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const params = new URLSearchParams({
        q: query,
        format: "json",
        limit: "5",
        countrycodes: "cr",
        addressdetails: "1",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        { headers: { "User-Agent": "FACFAST/1.0" } },
      );
      const data: NominatimResult[] = await res.json();
      setSearchResults(data);
      setShowResults(data.length > 0);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchAddress(value), 400);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchAddress(searchQuery);
    }
  }

  function handleSelectResult(result: NominatimResult) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    mapRef.current?.setView([lat, lng], ZONE_ZOOM);
    setSearchQuery(result.display_name.split(",")[0]);
    setShowResults(false);
  }

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="relative" style={{ zIndex: 10 }}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar ubicación para centrar mapa..."
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            disabled={disabled}
            className="h-8 text-xs pl-8 pr-8"
          />
          {searching ? (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground animate-spin" />
          ) : null}
        </div>
        {showResults ? (
          <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
            {searchResults.map((result, i) => (
              <button
                key={`${result.lat}-${result.lon}-${i}`}
                type="button"
                className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors border-b last:border-b-0"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectResult(result)}
              >
                {result.display_name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Map */}
      <div className="h-64 rounded-lg overflow-hidden border" style={{ position: "relative", zIndex: 0 }}>
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!drawing ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleStartDrawing}
              disabled={disabled}
            >
              <Pencil className="size-3 mr-1" />
              {boundary && boundary.length >= 3 ? "Redibujar zona" : "Dibujar zona"}
            </Button>
            {boundary && boundary.length >= 3 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={handleClear}
                disabled={disabled}
              >
                <Trash2 className="size-3 mr-1" />
                Limpiar
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-7 text-xs"
              onClick={handleFinishDrawing}
              disabled={pointCount < 3}
            >
              Cerrar polígono ({pointCount} puntos)
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleCancelDrawing}
            >
              <X className="size-3 mr-1" />
              Cancelar
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">
              Click en el mapa para agregar puntos
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export { ZonePolygonEditorInner };
export type { ZonePolygonEditorInnerProps };
