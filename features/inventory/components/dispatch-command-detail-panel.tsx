"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  GripVertical,
  MapPin,
  Package,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { DispatchOrder, DispatchStop } from "../types";
import { UpdateStopStatusDialog } from "./update-stop-status-dialog";
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
  onEdit?: () => void;
  onDispatch?: () => void;
  onCancel?: () => void;
  onAddStop?: () => void;
};


// --- Sortable stop item ---
type SortableStopItemProps = {
  stop: DispatchStop;
  t: ReturnType<typeof useAppTranslator>["t"];
  canChangeStatus?: boolean;
  onStatusChange?: (stop: DispatchStop) => void;
};

const RESOLVED_STATUSES = new Set(["delivered", "failed", "partial", "skipped"]);
const STATUS_TRANSITION_OPTIONS = ["in_transit", "delivered", "failed", "partial", "skipped"] as const;

function SortableStopItem({ stop, t, canChangeStatus, onStatusChange }: SortableStopItemProps) {
  const [expanded, setExpanded] = useState(false);
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
          {canChangeStatus && !RESOLVED_STATUSES.has(stop.status) && onStatusChange ? (
            <Select
              value={stop.status}
              onValueChange={() => onStatusChange(stop)}
            >
              <SelectTrigger className="h-5 w-auto gap-1 border-0 px-1.5 py-0 text-[10px] font-medium shrink-0 rounded-full shadow-none [&>svg]:size-3">
                <span className={`inline-flex items-center rounded-full px-1 py-0 ${dispatchStopStatusColorMap[stop.status] ?? ""}`}>
                  {t(dispatchStopStatusTranslationMap[stop.status] ?? "inventory.dispatch.stop_pending")}
                </span>
              </SelectTrigger>
              <SelectContent>
                {STATUS_TRANSITION_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${dispatchStopStatusColorMap[s] ?? ""}`}>
                      {t(dispatchStopStatusTranslationMap[s])}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span
              className={`inline-flex items-center rounded-full px-1.5 py-0 text-[10px] font-medium shrink-0 ${
                dispatchStopStatusColorMap[stop.status] ?? ""
              }`}
            >
              {t(dispatchStopStatusTranslationMap[stop.status] ?? "inventory.dispatch.stop_pending")}
            </span>
          )}
        </div>

        {address ? (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            {address}
          </p>
        ) : null}

        {(stop.lines?.length ?? 0) > 0 ? (
          <button
            type="button"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            <Package className="size-3" />
            {stop.lines!.length} {t("inventory.dispatch.product")}
            <ChevronDown className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        ) : null}

        {expanded && stop.lines?.length ? (
          <div className="rounded border bg-muted/30 text-xs mt-1">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left font-medium">{t("inventory.dispatch.product")}</th>
                  <th className="px-2 py-1 text-right font-medium w-12">{t("inventory.dispatch.ordered")}</th>
                  <th className="px-2 py-1 text-right font-medium w-12">{t("inventory.dispatch.delivered")}</th>
                </tr>
              </thead>
              <tbody>
                {stop.lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-b-0">
                    <td className="px-2 py-1 truncate max-w-[120px]">
                      {line.product_variant?.product?.name ?? line.product_variant?.sku ?? `#${line.product_variant_id}`}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">{line.ordered_quantity}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{line.delivered_quantity ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  onEdit,
  onDispatch,
  onCancel,
  onAddStop,
}: DispatchCommandDetailPanelProps) {
  const { t } = useAppTranslator();
  const [statusChangeStop, setStatusChangeStop] = useState<DispatchStop | null>(null);

  const canChangeStopStatus =
    dispatchOrder.status === "dispatched" || dispatchOrder.status === "in_transit";

  const [dragOrderOverride, setDragOrderOverride] = useState<string[] | null>(null);

  const sortedStops = useMemo(
    () =>
      [...(dispatchOrder.stops ?? [])].sort(
        (a, b) => a.delivery_sequence - b.delivery_sequence,
      ),
    [dispatchOrder.stops],
  );

  const orderedStops = useMemo(() => {
    if (!dragOrderOverride) return sortedStops;
    const map = new Map(sortedStops.map((s) => [String(s.id), s]));
    return dragOrderOverride.map((id) => map.get(id)).filter(Boolean) as DispatchStop[];
  }, [sortedStops, dragOrderOverride]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const ids = orderedStops.map((s) => String(s.id));
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      setDragOrderOverride(arrayMove(ids, oldIndex, newIndex));
    },
    [orderedStops],
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
                <SortableStopItem
                  key={stop.id}
                  stop={stop}
                  t={t}
                  canChangeStatus={canChangeStopStatus}
                  onStatusChange={setStatusChangeStop}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {orderedStops.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("inventory.dispatch.no_stops")}
          </p>
        ) : null}

        {dispatchOrder.lifecycle?.can_edit && onAddStop ? (
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={onAddStop}>
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
          {dispatchOrder.lifecycle?.can_dispatch && onDispatch ? (
            <Button className="w-full" size="sm" onClick={onDispatch}>
              {t("inventory.dispatch.mark_dispatched")}
            </Button>
          ) : null}
          <div className="flex gap-2">
            {dispatchOrder.lifecycle?.can_edit && onEdit ? (
              <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
                {t("inventory.dispatch.edit")}
              </Button>
            ) : null}
            {dispatchOrder.lifecycle?.can_cancel && onCancel ? (
              <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700" onClick={onCancel}>
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

      {statusChangeStop ? (
        <UpdateStopStatusDialog
          orderId={String(dispatchOrder.id)}
          stop={statusChangeStop}
          open
          onOpenChange={(open) => {
            if (!open) setStatusChangeStop(null);
          }}
        />
      ) : null}
    </div>
  );
}

export { DispatchCommandDetailPanel };
