"use client";

import { useCallback, useMemo } from "react";
import { X } from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import type { MapMarker } from "./map-view-inner";

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

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  disabled?: boolean;
};

function LocationPicker({ latitude, longitude, onChange, disabled }: LocationPickerProps) {
  const hasCoordinates = latitude != null && longitude != null;

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

  function handleLatChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    if (value === "") {
      onChange(null, longitude);
      return;
    }
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      onChange(parsed, longitude);
    }
  }

  function handleLngChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    if (value === "") {
      onChange(latitude, null);
      return;
    }
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      onChange(latitude, parsed);
    }
  }

  function handleClear() {
    onChange(null, null);
  }

  return (
    <div className="space-y-2">
      <div className="h-48 rounded-lg overflow-hidden border">
        <MapViewInner
          markers={markers}
          center={center}
          zoom={zoom}
          className="!min-h-0 h-full"
          onClick={handleMapClick}
        />
      </div>

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
