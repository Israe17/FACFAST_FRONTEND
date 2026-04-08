"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ZonePolygonEditorInner = dynamic(
  () => import("./zone-polygon-editor-inner").then((mod) => mod.ZonePolygonEditorInner),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-64 rounded-lg" />,
  },
);

type ZonePolygonEditorProps = {
  boundary: [number, number][] | null;
  onChange: (boundary: [number, number][] | null, center: [number, number] | null) => void;
  disabled?: boolean;
};

function ZonePolygonEditor(props: ZonePolygonEditorProps) {
  return <ZonePolygonEditorInner {...props} />;
}

export { ZonePolygonEditor };
