/**
 * Mirror of the backend `REALTIME_EVENTS` catalog (see
 * src/modules/realtime/contracts/realtime-events.ts in FACFAST_BACKEND).
 * Keep both in sync — until codegen exists, treat the backend file as
 * authoritative.
 */
export const REALTIME_EVENTS = {
  PERMISSIONS_CHANGED: "permissions.changed",
  PERMISSIONS_CATALOG_UPDATED: "permissions.catalog_updated",
  SESSION_INVALIDATED: "session.invalidated",
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export type RealtimeEventPayloads = {
  [REALTIME_EVENTS.PERMISSIONS_CHANGED]: { reason?: string };
  [REALTIME_EVENTS.PERMISSIONS_CATALOG_UPDATED]: Record<string, never>;
  [REALTIME_EVENTS.SESSION_INVALIDATED]: { reason?: string };
};

export const REALTIME_NAMESPACE = "/realtime";
