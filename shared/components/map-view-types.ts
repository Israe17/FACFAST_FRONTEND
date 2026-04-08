import type { ReactNode } from "react";

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
