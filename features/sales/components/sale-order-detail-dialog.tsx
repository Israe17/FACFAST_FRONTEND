"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  MapPin,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  User,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { MapView, type MapMarker } from "@/shared/components/map-view";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import type { FrontendTranslationKey } from "@/shared/i18n/translations";
import { formatDate, formatDateTime } from "@/shared/lib/utils";

import { useSaleOrderQuery, useResetSaleOrderDispatchStatusMutation, useCancelSaleOrderLineMutation } from "../queries";
import type { SaleOrder, SaleOrderLine } from "../types";

type SaleOrderDetailDialogProps = {
  order: SaleOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const statusColorMap: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusTranslationMap: Record<string, FrontendTranslationKey> = {
  draft: "sales.status_draft",
  confirmed: "sales.status_confirmed",
  cancelled: "sales.status_cancelled",
};

const dispatchColorMap: Record<string, string> = {
  not_required: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  partial: "bg-orange-100 text-orange-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
};

const dispatchTranslationMap: Record<string, FrontendTranslationKey> = {
  not_required: "sales.dispatch_not_required",
  pending: "sales.dispatch_pending",
  assigned: "sales.dispatch_assigned",
  out_for_delivery: "sales.dispatch_out_for_delivery",
  delivered: "sales.dispatch_delivered",
  partial: "sales.dispatch_partial",
  failed: "sales.dispatch_failed",
  cancelled: "sales.dispatch_cancelled",
};

const fulfillmentTranslationMap: Record<string, FrontendTranslationKey> = {
  pickup: "sales.fulfillment_pickup",
  delivery: "sales.fulfillment_delivery",
};

const saleModeTranslationMap: Record<string, FrontendTranslationKey> = {
  branch_direct: "sales.mode_branch_direct",
  seller_attributed: "sales.mode_seller_attributed",
  seller_route: "sales.mode_seller_route",
};

const reservationColorMap: Record<string, string> = {
  active: "bg-yellow-100 text-yellow-800",
  consumed: "bg-green-100 text-green-800",
  released: "bg-gray-100 text-gray-800",
};

const reservationTranslationMap: Record<string, FrontendTranslationKey> = {
  active: "sales.reservation_active",
  consumed: "sales.reservation_consumed",
  released: "sales.reservation_released",
};

const doStatusColorMap: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  ready: "bg-blue-100 text-blue-800",
  dispatched: "bg-indigo-100 text-indigo-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function SaleOrderDetailDialog({
  order,
  open,
  onOpenChange,
}: SaleOrderDetailDialogProps) {
  const { t } = useAppTranslator();
  const [cancelLineTarget, setCancelLineTarget] = useState<SaleOrderLine | null>(null);

  // Fetch full detail (with lines + delivery_charges)
  const detailQuery = useSaleOrderQuery(order?.id ? String(order.id) : "");
  const fullOrder = detailQuery.data ?? order;

  const resetDispatchMutation = useResetSaleOrderDispatchStatusMutation(
    order?.id ? String(order.id) : "",
  );

  const cancelLineMutation = useCancelSaleOrderLineMutation(
    order?.id ? String(order.id) : "",
  );

  if (!fullOrder) return null;

  const lines = fullOrder.lines ?? [];
  const deliveryCharges = fullOrder.delivery_charges ?? [];
  const linesTotal = lines.reduce((sum, line) => sum + (line.line_total ?? 0), 0);
  const chargesTotal = deliveryCharges.reduce((sum, c) => sum + c.amount, 0);
  const grandTotal = linesTotal + chargesTotal;

  return (
  <>
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent size="md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            {fullOrder.code ?? t("sales.entity.sale_order")}
          </SheetTitle>
          <SheetDescription>
            {t("sales.detail_description")}
          </SheetDescription>
        </SheetHeader>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t("sales.status")}</p>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColorMap[fullOrder.status] ?? ""}`}
            >
              {t(statusTranslationMap[fullOrder.status] ?? "sales.status_draft")}
            </span>
          </div>
          <div>
            <p className="text-muted-foreground">{t("sales.dispatch_status")}</p>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${dispatchColorMap[fullOrder.dispatch_status] ?? ""}`}
            >
              {t(dispatchTranslationMap[fullOrder.dispatch_status] ?? "sales.dispatch_not_required")}
            </span>
          </div>
          <div>
            <p className="text-muted-foreground">{t("sales.sale_mode")}</p>
            <p className="font-medium">
              {t(saleModeTranslationMap[fullOrder.sale_mode] ?? "sales.mode_branch_direct")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("sales.fulfillment")}</p>
            <p className="font-medium">
              {t(fulfillmentTranslationMap[fullOrder.fulfillment_mode] ?? "sales.fulfillment_pickup")}
            </p>
          </div>
          {fullOrder.branch ? (
            <div>
              <p className="text-muted-foreground">{t("sales.branch")}</p>
              <p className="font-medium">{fullOrder.branch.name}</p>
            </div>
          ) : null}
          {fullOrder.customer_contact ? (
            <div>
              <p className="text-muted-foreground">{t("sales.customer")}</p>
              <p className="font-medium flex items-center gap-1">
                <User className="size-3" />
                {fullOrder.customer_contact.name}
              </p>
            </div>
          ) : null}
          {fullOrder.seller ? (
            <div>
              <p className="text-muted-foreground">{t("sales.seller")}</p>
              <p className="font-medium">{fullOrder.seller.name}</p>
            </div>
          ) : null}
          {fullOrder.warehouse ? (
            <div>
              <p className="text-muted-foreground">{t("sales.warehouse")}</p>
              <p className="font-medium">{fullOrder.warehouse.name}</p>
            </div>
          ) : null}
          <div>
            <p className="text-muted-foreground">{t("sales.order_date")}</p>
            <p className="font-medium">{formatDate(fullOrder.order_date)}</p>
          </div>
          {fullOrder.delivery_requested_date ? (
            <div>
              <p className="text-muted-foreground">{t("sales.delivery_requested_date")}</p>
              <p className="font-medium">{formatDate(fullOrder.delivery_requested_date)}</p>
            </div>
          ) : null}
          {fullOrder.delivery_zone ? (
            <div>
              <p className="text-muted-foreground">{t("sales.delivery_zone")}</p>
              <p className="font-medium">{fullOrder.delivery_zone.name}</p>
            </div>
          ) : null}
          {fullOrder.delivery_address ? (
            <div className="col-span-2">
              <p className="text-muted-foreground">{t("sales.delivery_address")}</p>
              <p className="flex items-center gap-1">
                <MapPin className="size-3" />
                {[fullOrder.delivery_address, fullOrder.delivery_district, fullOrder.delivery_canton, fullOrder.delivery_province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          ) : null}
          {fullOrder.delivery_latitude && fullOrder.delivery_longitude ? (
            <div className="col-span-2">
              <DeliveryMapPreview
                lat={fullOrder.delivery_latitude}
                lng={fullOrder.delivery_longitude}
              />
            </div>
          ) : null}
          {fullOrder.notes ? (
            <div className="col-span-2">
              <p className="text-muted-foreground">{t("inventory.common.notes")}</p>
              <p>{fullOrder.notes}</p>
            </div>
          ) : null}
        </div>

        <Separator />

        {/* Lines Section */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Package className="size-4" />
            {t("sales.lines")} ({lines.length})
          </h3>
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("sales.no_lines")}
            </p>
          ) : (
            <div className="space-y-2">
              {lines
                .sort((a, b) => a.line_no - b.line_no)
                .map((line) => (
                  <div
                    key={line.id}
                    className={`flex items-center justify-between rounded-lg border p-3 ${line.status === "cancelled" ? "bg-muted/50 opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Badge variant="outline" className="text-xs shrink-0">
                        #{line.line_no}
                      </Badge>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${line.status === "cancelled" ? "line-through" : ""}`}>
                          {line.product_variant?.product?.name ?? ""}{" "}
                          {line.product_variant?.variant_name
                            ? `/ ${line.product_variant.variant_name}`
                            : ""}
                        </p>
                        {line.product_variant?.sku ? (
                          <p className="text-xs text-muted-foreground">
                            SKU: {line.product_variant.sku}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {line.status === "cancelled" ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                          {t("sales.line_status_cancelled")}
                        </span>
                      ) : line.reservation ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${reservationColorMap[line.reservation.status] ?? "bg-gray-100 text-gray-800"}`}
                          title={`${t("sales.reservation_active")}: ${line.reservation.reserved_quantity} | ${t("sales.reservation_consumed")}: ${line.reservation.consumed_quantity} | ${t("sales.reservation_released")}: ${line.reservation.released_quantity}`}
                        >
                          {t(reservationTranslationMap[line.reservation.status] ?? "sales.reservation_active")}
                        </span>
                      ) : null}
                      <div className="text-right">
                        <p className={`text-sm tabular-nums ${line.status === "cancelled" ? "line-through" : ""}`}>
                          {line.quantity} x{" "}
                          {line.unit_price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        {line.discount_percent ? (
                          <p className="text-xs text-muted-foreground">
                            -{line.discount_percent}%
                          </p>
                        ) : null}
                        <p className={`text-sm font-medium tabular-nums ${line.status === "cancelled" ? "line-through" : ""}`}>
                          {(line.line_total ?? 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      {line.status !== "cancelled" &&
                        fullOrder.lifecycle?.can_cancel_lines ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => setCancelLineTarget(line)}
                          title={t("sales.cancel_line_title")}
                        >
                          <X className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>
                    {(line.assigned_serials ?? []).length > 0 ? (
                      <div className="mt-1.5 pl-1">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {t("sales.assigned_serials")}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(line.assigned_serials ?? []).map((s) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-mono"
                            >
                              {s.serial_number}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              <div className="flex justify-end pt-2 border-t">
                <span className="text-sm font-semibold tabular-nums">
                  {t("sales.subtotal")}:{" "}
                  {linesTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Charges Section */}
        {deliveryCharges.length > 0 ? (
          <>
            <Separator />
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Truck className="size-4" />
                {t("sales.delivery_charges")} ({deliveryCharges.length})
              </h3>
              <div className="space-y-2">
                {deliveryCharges.map((charge) => (
                  <div
                    key={charge.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {charge.charge_type.replace(/_/g, " ")}
                      </p>
                      {charge.notes ? (
                        <p className="text-xs text-muted-foreground">{charge.notes}</p>
                      ) : null}
                    </div>
                    <span className="font-medium tabular-nums">
                      {charge.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {/* Grand Total */}
        <Separator />
        <div className="flex justify-end">
          <span className="text-base font-bold tabular-nums">
            {t("sales.total")}:{" "}
            {grandTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* Dispatch Orders Section */}
        {fullOrder.dispatch_orders && fullOrder.dispatch_orders.length > 0 ? (
          <>
            <Separator />
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Truck className="size-4" />
                {t("sales.dispatch_orders_section")} ({fullOrder.dispatch_orders.length})
              </h3>
              <div className="space-y-2">
                {fullOrder.dispatch_orders.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{d.code ?? `DO-${d.id}`}</p>
                      {d.scheduled_date ? (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(d.scheduled_date)}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${doStatusColorMap[d.status] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {t(`inventory.dispatch.status_${d.status}` as FrontendTranslationKey)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : fullOrder.status === "confirmed" &&
          fullOrder.dispatch_status === "pending" ? (
          <>
            <Separator />
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Truck className="size-4" />
                {t("sales.dispatch_orders_section")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("sales.no_dispatch_orders")}
              </p>
            </div>
          </>
        ) : null}

        {/* Created By */}
        {fullOrder.created_by_user ? (
          <div className="text-xs text-muted-foreground">
            {t("sales.created_by")}: {fullOrder.created_by_user.name}
            {fullOrder.created_at ? ` — ${formatDateTime(fullOrder.created_at)}` : ""}
          </div>
        ) : null}

        {/* Re-dispatch action */}
        {fullOrder.lifecycle?.can_reset_dispatch ? (
          <ResetDispatchSection
            order={fullOrder}
            mutation={resetDispatchMutation}
          />
        ) : null}
      </SheetContent>
    </Sheet>

    {cancelLineTarget ? (
      <CancelLineConfirmDialog
        line={cancelLineTarget}
        open={cancelLineTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelLineTarget(null);
        }}
        onConfirm={(reason) => {
          cancelLineMutation.mutate(
            { lineId: String(cancelLineTarget.id), payload: { reason } },
            { onSuccess: () => setCancelLineTarget(null) },
          );
        }}
        isPending={cancelLineMutation.isPending}
      />
    ) : null}
  </>
  );
}

function CancelLineConfirmDialog({
  line,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  line: SaleOrderLine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const { t } = useAppTranslator();
  const [reason, setReason] = useState("");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("sales.cancel_line_title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("sales.cancel_line_description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label className="text-sm">{t("sales.cancel_line_reason")}</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("sales.cancel_line_reason")}
            rows={2}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm(reason);
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? t("common.saving") : t("sales.cancel_line_confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeliveryMapPreview({ lat, lng }: { lat: number; lng: number }) {
  const markers = useMemo<MapMarker[]>(
    () => [{ id: "delivery", lat, lng, color: "#3b82f6" }],
    [lat, lng],
  );

  return (
    <div className="h-32 rounded-lg overflow-hidden border">
      <MapView
        markers={markers}
        center={[lat, lng]}
        zoom={14}
        className="!min-h-0 h-full"
      />
    </div>
  );
}

function ResetDispatchSection({
  order,
  mutation,
}: {
  order: SaleOrder;
  mutation: ReturnType<typeof useResetSaleOrderDispatchStatusMutation>;
}) {
  const { t } = useAppTranslator();
  const [newDate, setNewDate] = useState(order.delivery_requested_date ?? "");

  function handleReset() {
    mutation.mutate(
      newDate ? { delivery_requested_date: newDate } : undefined,
    );
  }

  return (
    <>
      <Separator />
      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold">{t("sales.reset_dispatch_title")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("sales.reset_dispatch_description", { code: order.code ?? "" })}
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs">{t("sales.delivery_requested_date")}</Label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <Button
            size="default"
            variant="outline"
            onClick={handleReset}
            disabled={mutation.isPending}
            className="shrink-0"
          >
            <RefreshCw className={`size-4 mr-1.5 ${mutation.isPending ? "animate-spin" : ""}`} />
            {mutation.isPending ? t("common.saving") : t("sales.reset_dispatch_title")}
          </Button>
        </div>
      </div>
    </>
  );
}

export { SaleOrderDetailDialog };
