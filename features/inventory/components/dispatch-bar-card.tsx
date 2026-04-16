"use client";

import { useMemo } from "react";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { DispatchOrder } from "../types";
import {
  dispatchStatusColorMap,
  dispatchStatusTranslationMap,
  dispatchProgressColorMap,
} from "../constants";

type DispatchBarCardProps = {
  order: DispatchOrder;
  isSelected: boolean;
  onClick: (orderId: string) => void;
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
          className={`inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-medium leading-tight shrink-0 ${dispatchStatusColorMap[order.status] ?? ""}`}
        >
          {t(
            dispatchStatusTranslationMap[order.status] ??
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
          className={`h-full rounded-full transition-all ${dispatchProgressColorMap[order.status] ?? "bg-gray-400"}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

export { DispatchBarCard };
