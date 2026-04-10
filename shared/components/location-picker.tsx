"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import type { MapMarker } from "./map-view-types";

const MapViewInner = dynamic(
  () => import("./map-view-inner").then((mod) => mod.MapViewInner),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-48 rounded-lg" />,
  },
);

// Costa Rica center
const DEFAULT_CENTER: [number, number] = [9.9281, -84.0907];
const DEFAULT_ZOOM = 8;
const PLACED_ZOOM = 14;

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  disabled?: boolean;
};

function LocationPicker({ latitude, longitude, onChange, disabled }: LocationPickerProps) {
  const hasCoordinates = Boolean(latitude) && Boolean(longitude);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const center: [number, number] = hasCoordinates
    ? [latitude, longitude]
    : DEFAULT_CENTER;

  const zoom = hasCoordinates ? PLACED_ZOOM : DEFAULT_ZOOM;

  const markers = useMemo<MapMarker[]>(() => {
    if (!hasCoordinates) return [];
    return [
      {
        id: "location",
        lat: latitude,
        lng: longitude,
        color: "#3b82f6",
      },
    ];
  }, [hasCoordinates, latitude, longitude]);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (disabled) return;
      onChange(lat, lng);
    },
    [disabled, onChange],
  );

  async function searchAddress(query: string) {
    if (query.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      // Try Nominatim first with detailed search
      const nominatimParams = new URLSearchParams({
        q: query,
        format: "json",
        limit: "5",
        countrycodes: "cr",
        addressdetails: "1",
        dedupe: "1",
      });
      const nominatimRes = await fetch(
        `https://nominatim.openstreetmap.org/search?${nominatimParams}`,
        { headers: { "User-Agent": "FACFAST/1.0" } },
      );
      let data: NominatimResult[] = await nominatimRes.json();

      // If Nominatim returns few results, also try Photon (better fuzzy matching)
      if (data.length < 3) {
        try {
          const photonParams = new URLSearchParams({
            q: query,
            limit: "5",
            lang: "es",
            lat: "9.9281",
            lon: "-84.0907",
            bbox: "-86.0,8.0,-82.5,11.2",
          });
          const photonRes = await fetch(
            `https://photon.komoot.io/api/?${photonParams}`,
          );
          const photonData = await photonRes.json();
          const photonResults: NominatimResult[] = (photonData.features ?? [])
            .filter((f: any) => f.properties?.country === "Costa Rica")
            .map((f: any) => ({
              display_name: [
                f.properties.name,
                f.properties.street,
                f.properties.city ?? f.properties.county,
                f.properties.state,
              ]
                .filter(Boolean)
                .join(", "),
              lat: String(f.geometry.coordinates[1]),
              lon: String(f.geometry.coordinates[0]),
            }));

          // Merge results, deduplicate by proximity
          const existing = new Set(data.map((d) => `${parseFloat(d.lat).toFixed(3)},${parseFloat(d.lon).toFixed(3)}`));
          for (const r of photonResults) {
            const key = `${parseFloat(r.lat).toFixed(3)},${parseFloat(r.lon).toFixed(3)}`;
            if (!existing.has(key)) {
              data.push(r);
              existing.add(key);
            }
          }
          data = data.slice(0, 7);
        } catch {
          // Photon fallback is best-effort
        }
      }

      setSearchResults(data);
      setShowResults(data.length > 0);
    } catch {
      setSearchResults([]);
      setShowResults(false);
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
    onChange(lat, lng);
    setSearchQuery(result.display_name.split(",")[0]);
    setShowResults(false);
  }

  function handleLatChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    if (value === "") {
      onChange(null, longitude);
      return;
    }
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) onChange(parsed, longitude);
  }

  function handleLngChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    if (value === "") {
      onChange(latitude, null);
      return;
    }
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) onChange(latitude, parsed);
  }

  function handleClear() {
    onChange(null, null);
  }

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="relative" style={{ zIndex: 10 }}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar dirección..."
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
      <div className="h-48 rounded-lg overflow-hidden border" style={{ position: "relative", zIndex: 0 }}>
        <MapViewInner
          markers={markers}
          center={center}
          zoom={zoom}
          className="!min-h-0 h-full"
          onClick={handleMapClick}
        />
      </div>

      {/* Lat/Lng inputs */}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">Latitud</Label>
          <Input
            type="number"
            step="any"
            placeholder="9.9281"
            value={latitude ?? ""}
            onChange={handleLatChange}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label className="text-xs">Longitud</Label>
          <Input
            type="number"
            step="any"
            placeholder="-84.0907"
            value={longitude ?? ""}
            onChange={handleLngChange}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        {hasCoordinates ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleClear}
            disabled={disabled}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { LocationPicker };
