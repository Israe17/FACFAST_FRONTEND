"use client";

import { useMemo } from "react";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import type { FrontendTranslationKey } from "@/shared/i18n/translations";

import type { DispatchOrder } from "../types";

type DispatchBarCardProps = {
  order: DispatchOrder;
  isSelected: boolean;
  onClick: (orderId: string) => void;
};

const statusColorMap: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  ready: "bg-blue-100 text-blue-800",
  dispatched: "bg-indigo-100 text-indigo-800",
  in_transit: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusTranslationMap: Record<string, FrontendTranslationKey> = {
  draft: "inventory.dispatch.status_draft",
  ready: "inventory.dispatch.status_ready",
  dispatched: "inventory.dispatch.status_dispatched",
  in_transit: "inventory.dispatch.status_in_transit",
  completed: "inventory.dispatch.status_completed",
  cancelled: "inventory.dispatch.status_cancelled",
};

const progressColorMap: Record<string, string> = {
  draft: "bg-yellow-400",
  ready: "bg-blue-400",
  dispatched: "bg-indigo-400",
  in_transit: "bg-orange-400",
  completed: "bg-green-400",
  cancelled: "bg-red-400",
};

function DispatchBarCard({ order, isSelected, onClick }: DispatchBarCardProps) {
  const { t } = useAppTranslator();

  const stops = order.stops ?? [];
  const deliveredCount = useMemo(
    () => stops.filter((s) => s.status === "delivered").length,
    [stops],
  );
  const totalStops = stops.length;
  const progressPercent =
    totalStops > 0 ? (deliveredCount / totalStops) * 100 : 0;

  const vehicleLabel = order.vehicle?.plate_number ?? t("inventory.dispatch.no_vehicle");
  const driverLabel = order.driver_user?.name ?? t("inventory.dispatch.no_driver");

  return (
    <div
      role="button"
      tabIndex={0}
      className={`min-w-[200px] max-w-[240px] shrink-0 rounded-lg border bg-card px-3 py-1.5 cursor-pointer transition-all hover:shadow-sm ${
        isSelected ? "ring-2 ring-primary shadow-sm" : ""
      }`}
      onClick={() => onClick(String(order.id))}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(String(order.id));
        }
      }}
    >
      {/* Row 1: code + status badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold truncate">
          {order.code ?? `DO-${order.id}`}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-medium leading-tight shrink-0 ${statusColorMap[order.status] ?? ""}`}
        >
          {t(
            statusTranslationMap[order.status] ??
              "inventory.dispatch.status_draft",
          )}
        </span>
      </div>

      {/* Row 2: vehicle · driver · stops */}
      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
        {vehicleLabel} · {driverLabel} · {deliveredCount}/{totalStops}
      </p>

      {/* Row 3: thin progress bar */}
      <div className="h-0.5 w-full rounded-full bg-muted overflow-hidden mt-1">
        <div
          className={`h-full rounded-full transition-all ${progressColorMap[order.status] ?? "bg-gray-400"}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

export { DispatchBarCard };
