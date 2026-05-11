"use client";

import { useEffect, useRef, useState } from "react";
import { WifiOff } from "lucide-react";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";

import { useRealtimeConnectionStatus } from "./realtime-provider";

const DISCONNECT_GRACE_MS = 5_000;

/**
 * Sticky bottom banner that surfaces a sustained realtime disconnect.
 *
 * Why a grace period: ordinary reconnects (token refresh, brief network
 * hiccup, server restart) recover in well under a second. Showing a
 * banner for those would be noise. We only render once the socket has
 * been disconnected for at least DISCONNECT_GRACE_MS — and only AFTER
 * it had connected at least once, so the login flicker before the first
 * connect doesn't trigger a banner either.
 *
 * UX: amber strip, fixed to the bottom of the viewport, dismisses itself
 * the instant the socket reconnects. No user action required — it is
 * informational only.
 */
export function RealtimeStatusBanner() {
  const { t } = useAppTranslator();
  const isConnected = useRealtimeConnectionStatus();
  const hasEverConnectedRef = useRef(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (isConnected) {
      hasEverConnectedRef.current = true;
      setShowBanner(false);
      return;
    }

    // Disconnected. Only escalate to a banner if we had a working
    // connection at some point — pre-first-connect (login flicker)
    // never shows the banner.
    if (!hasEverConnectedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      setShowBanner(true);
    }, DISCONNECT_GRACE_MS);

    return () => clearTimeout(timer);
  }, [isConnected]);

  if (!showBanner) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex items-start gap-3 border-t border-amber-300",
        "bg-amber-50 px-4 py-2 text-xs text-amber-900 shadow-lg",
      )}
    >
      <WifiOff
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0"
      />
      <div className="flex-1">
        <p className="font-medium">{t("realtime.disconnected.title")}</p>
        <p className="text-amber-800/90">
          {t("realtime.disconnected.description")}
        </p>
      </div>
    </div>
  );
}
