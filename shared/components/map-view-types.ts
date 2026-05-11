/**
 * Structured payload for a Leaflet popup. The marker layer renders each
 * field with `Element.textContent` so user-provided strings cannot inject
 * HTML — never accept a raw HTML string here. If a caller really needs to
 * compose richer content, add an explicit field to this type and render it
 * safely inside `map-view-inner.tsx`.
 */
export type MapPopupContent = {
  /** Rendered inside <strong>. */
  title?: string;
  /** Rendered below the title in a regular div. */
  subtitle?: string;
  /** Each entry is rendered as its own <em> line. */
  lines?: string[];
};

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  status?: string;
  popup?: MapPopupContent;
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
