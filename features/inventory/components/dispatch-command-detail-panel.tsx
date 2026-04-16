"use client";

import { useCallback, useState } from "react";
import {
  Calendar,
  ExternalLink,
  GripVertical,
  MapPin,
  Plus,
  Truck,
  User,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { DispatchOrder, DispatchStop } from "../types";
import {
  dispatchStatusColorMap,
  dispatchStatusTranslationMap,
  dispatchStopStatusColorMap,
  dispatchStopStatusTranslationMap,
} from "../constants";

type DispatchCommandDetailPanelProps = {
  dispatchOrder: DispatchOrder;
  onClose: () => void;
  onViewFullDetail?: () => void;
};


// --- Sortable stop item ---
type SortableStopItemProps = {
  stop: DispatchStop;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function SortableStopItem({ stop, t }: SortableStopItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(stop.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const address = [
    stop.delivery_address,
    stop.delivery_district,
    stop.delivery_canton,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 rounded-lg border p-2.5 bg-card ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      {/* Stop content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              #{stop.delivery_sequence}
            </Badge>
            <span className="text-sm font-medium truncate">
              {stop.customer_contact?.name ?? stop.sale_order?.code ?? `#${stop.id}`}
            </span>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0 text-[10px] font-medium shrink-0 ${
              dispatchStopStatusColorMap[stop.status] ?? ""
            }`}
          >
            {t(
              dispatchStopStatusTranslationMap[stop.status] ??
                "inventory.dispatch.stop_pending",
            )}
          </span>
        </div>

        {address ? (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            {address}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// --- Main panel component ---
function DispatchCommandDetailPanel({
  dispatchOrder,
  onClose,
  onViewFullDetail,
}: DispatchCommandDetailPanelProps) {
  const { t } = useAppTranslator();

  const [orderedStops, setOrderedStops] = useState<DispatchStop[]>(
    () =>
      [...(dispatchOrder.stops ?? [])].sort(
        (a, b) => a.delivery_sequence - b.delivery_sequence,
      ),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setOrderedStops((prev) => {
        const oldIndex = prev.findIndex((s) => String(s.id) === String(active.id));
        const newIndex = prev.findIndex((s) => String(s.id) === String(over.id));
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    },
    [],
  );

  const stopIds = orderedStops.map((s) => String(s.id));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold truncate">
            {dispatchOrder.code ?? t("inventory.entity.dispatch_order")}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${
              dispatchStatusColorMap[dispatchOrder.status] ?? ""
            }`}
          >
            {t(
              dispatchStatusTranslationMap[dispatchOrder.status] ??
                "inventory.dispatch.status_draft",
            )}
          </span>
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Info section */}
      <div className="px-3 py-3 space-y-2 text-sm shrink-0">
        {dispatchOrder.vehicle ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="size-3.5 shrink-0" />
            <span className="truncate">
              {dispatchOrder.vehicle.name} ({dispatchOrder.vehicle.plate_number})
            </span>
          </div>
        ) : null}
        {dispatchOrder.driver_user ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="size-3.5 shrink-0" />
            <span className="truncate">{dispatchOrder.driver_user.name}</span>
          </div>
        ) : null}
        {dispatchOrder.scheduled_date ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" />
            <span>{formatDateTime(dispatchOrder.scheduled_date)}</span>
          </div>
        ) : null}
      </div>

      <Separator />

      {/* Stops list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          {t("inventory.dispatch.stops")} ({orderedStops.length})
        </p>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stopIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {orderedStops.map((stop) => (
                <SortableStopItem key={stop.id} stop={stop} t={t} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {orderedStops.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("inventory.dispatch.no_stops")}
          </p>
        ) : null}

        {dispatchOrder.lifecycle?.can_edit ? (
          <Button variant="outline" size="sm" className="w-full mt-2">
            <Plus className="size-4" />
            {t("inventory.dispatch.add_stop")}
          </Button>
        ) : null}
      </div>

      <Separator />

      {/* Action buttons — only show if any action is available */}
      {(dispatchOrder.lifecycle?.can_dispatch ||
        dispatchOrder.lifecycle?.can_edit ||
        dispatchOrder.lifecycle?.can_cancel) ? (
        <div className="px-3 py-3 shrink-0 space-y-2">
          {dispatchOrder.lifecycle?.can_dispatch ? (
            <Button className="w-full" size="sm">
              {t("inventory.dispatch.mark_dispatched")}
            </Button>
          ) : null}
          <div className="flex gap-2">
            {dispatchOrder.lifecycle?.can_edit ? (
              <Button variant="outline" size="sm" className="flex-1">
                {t("inventory.dispatch.edit")}
              </Button>
            ) : null}
            {dispatchOrder.lifecycle?.can_cancel ? (
              <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                {t("inventory.dispatch.cancel")}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* View full detail button */}
      {onViewFullDetail ? (
        <div className="px-3 pb-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onViewFullDetail}
          >
            <ExternalLink className="size-3.5" />
            {t("inventory.dispatch.view_full_detail")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export { DispatchCommandDetailPanel };
