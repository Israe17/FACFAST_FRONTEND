"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export type { MapMarker, MapPolyline } from "./map-view-inner";

const MapViewInner = dynamic(
  () => import("./map-view-inner").then((mod) => mod.MapViewInner),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="w-full h-full min-h-[400px] rounded-lg" />
    ),
  },
);

export { MapViewInner as MapView };
