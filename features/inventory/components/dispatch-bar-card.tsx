"use client";

import { useMemo } from "react";
import { Truck } from "lucide-react";

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
  const progressPercent = totalStops > 0 ? (deliveredCount / totalStops) * 100 : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`min-w-[220px] shrink-0 rounded-lg border bg-card p-3 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary shadow-md" : ""
      }`}
      onClick={() => onClick(String(order.id))}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(String(order.id));
        }
      }}
    >
      {/* Status badge */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColorMap[order.status] ?? ""}`}
        >
          {t(statusTranslationMap[order.status] ?? "inventory.dispatch.status_draft")}
        </span>
        <Truck className="size-3.5 text-muted-foreground" />
      </div>

      {/* Code + vehicle plate */}
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-sm font-medium truncate">
          {order.code ?? `DO-${order.id}`}
        </span>
        {order.vehicle ? (
          <span className="text-[10px] text-muted-foreground font-mono">
            {order.vehicle.plate_number}
          </span>
        ) : null}
      </div>

      {/* Driver name */}
      {order.driver_user ? (
        <p className="text-xs text-muted-foreground truncate mb-1.5">
          {order.driver_user.name}
        </p>
      ) : null}

      {/* Stop count + progress text */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
        <span>
          {t("inventory.dispatch.stops_label")}
        </span>
        <span className="font-medium tabular-nums">
          {deliveredCount}/{totalStops}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${progressColorMap[order.status] ?? "bg-gray-400"}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

export { DispatchBarCard };
