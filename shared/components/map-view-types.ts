import type { ReactNode } from "react";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  status?: string;
  popup?: string | ReactNode;
  color?: string;
  opacity?: number;
};

export type MapPolyline = {
  id: string;
  points: [number, number][];
  color?: string;
  weight?: number;
  dashArray?: string;
};

export type MapPolygon = {
  id: string;
  points: [number, number][];
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  label?: string;
};
