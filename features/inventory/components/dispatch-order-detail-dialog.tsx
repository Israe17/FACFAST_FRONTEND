"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  MapPin,
  Package,
  Truck,
  User,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import type { FrontendTranslationKey } from "@/shared/i18n/translations";
import { formatDateTime } from "@/shared/lib/utils";

import type { DispatchOrder, DispatchStop } from "../types";
import { UpdateStopStatusDialog } from "./update-stop-status-dialog";

type DispatchOrderDetailDialogProps = {
  order: DispatchOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const stopStatusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  partial: "bg-orange-100 text-orange-800",
  skipped: "bg-gray-100 text-gray-800",
};

const stopStatusTranslationMap: Record<string, FrontendTranslationKey> = {
  pending: "inventory.dispatch.stop_pending",
  in_transit: "inventory.dispatch.stop_in_transit",
  delivered: "inventory.dispatch.stop_delivered",
  failed: "inventory.dispatch.stop_failed",
  partial: "inventory.dispatch.stop_partial",
  skipped: "inventory.dispatch.stop_skipped",
};

function ReadinessItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle className="size-4 text-green-600" />
      ) : (
        <XCircle className="size-4 text-red-500" />
      )}
      <span className={ok ? "text-muted-foreground" : "font-medium"}>
        {label}
      </span>
    </div>
  );
}

function DispatchOrderDetailDialog({
  order,
  open,
  onOpenChange,
}: DispatchOrderDetailDialogProps) {
  const { t } = useAppTranslator();
  const [stopStatusTarget, setStopStatusTarget] = useState<DispatchStop | null>(null);

  if (!order) return null;

  const stops = order.stops ?? [];
  const expenses = order.expenses ?? [];
  const lifecycle = order.lifecycle ?? {};

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent size="md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="size-5" />
              {order.code ?? t("inventory.entity.dispatch_order")}
            </SheetTitle>
            <SheetDescription>
              {t("inventory.dispatch.detail_description")}
            </SheetDescription>
          </SheetHeader>

          <SheetBody>
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t("inventory.dispatch.status")}</p>
              <span
                className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColorMap[order.status] ?? ""}`}
              >
                {t(statusTranslationMap[order.status] ?? "inventory.dispatch.status_draft")}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground">{t("inventory.dispatch.dispatch_type")}</p>
              <p className="font-medium capitalize">{order.dispatch_type}</p>
            </div>
            {order.route ? (
              <div>
                <p className="text-muted-foreground">{t("inventory.dispatch.route")}</p>
                <p className="font-medium">{order.route.name}</p>
              </div>
            ) : null}
            {order.vehicle ? (
              <div>
                <p className="text-muted-foreground">{t("inventory.dispatch.vehicle")}</p>
                <p className="font-medium">
                  {order.vehicle.name} ({order.vehicle.plate_number})
                </p>
              </div>
            ) : null}
            {order.driver_user ? (
              <div>
                <p className="text-muted-foreground">{t("inventory.dispatch.driver")}</p>
                <p className="font-medium">{order.driver_user.name}</p>
              </div>
            ) : null}
            {order.origin_warehouse ? (
              <div>
                <p className="text-muted-foreground">{t("inventory.dispatch.origin_warehouse")}</p>
                <p className="font-medium">{order.origin_warehouse.name}</p>
              </div>
            ) : null}
            {order.scheduled_date ? (
              <div>
                <p className="text-muted-foreground">{t("inventory.dispatch.scheduled_date")}</p>
                <p className="font-medium">{formatDateTime(order.scheduled_date)}</p>
              </div>
            ) : null}
            {order.notes ? (
              <div className="col-span-2">
                <p className="text-muted-foreground">{t("inventory.common.notes")}</p>
                <p>{order.notes}</p>
              </div>
            ) : null}
          </div>

          {/* Readiness Checklist (draft only) */}
          {order.status === "draft" && order.lifecycle?.readiness ? (
            <>
              <Separator />
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <AlertCircle className="size-4" />
                  {t("inventory.dispatch.readiness_title")}
                </h3>
                <div className="space-y-1.5 text-sm">
                  <ReadinessItem
                    ok={!order.lifecycle.readiness.missing_scheduled_date}
                    label={t("inventory.dispatch.readiness_scheduled_date")}
                  />
                  <ReadinessItem
                    ok={!order.lifecycle.readiness.missing_vehicle}
                    label={t("inventory.dispatch.readiness_vehicle")}
                  />
                  <ReadinessItem
                    ok={!order.lifecycle.readiness.missing_driver}
                    label={t("inventory.dispatch.readiness_driver")}
                  />
                  <ReadinessItem
                    ok={!order.lifecycle.readiness.missing_stops}
                    label={t("inventory.dispatch.readiness_stops")}
                  />
                  {order.lifecycle.readiness.has_date_conflicts ? (
                    <ReadinessItem
                      ok={false}
                      label={t("inventory.dispatch.readiness_date_conflicts")}
                    />
                  ) : null}
                </div>
              </div>
            </>
          ) : null}

          <Separator />

          {/* Stops Section */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <MapPin className="size-4" />
              {t("inventory.dispatch.stops")} ({stops.length})
            </h3>
            {stops.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("inventory.dispatch.no_stops")}
              </p>
            ) : (
              <div className="space-y-3">
                {stops
                  .sort((a, b) => a.delivery_sequence - b.delivery_sequence)
                  .map((stop) => (
                    <div
                      key={stop.id}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{stop.delivery_sequence}
                          </Badge>
                          <span className="font-medium text-sm">
                            {stop.sale_order?.code ?? `Orden #${stop.sale_order_id}`}
                          </span>
                          {stop.customer_contact ? (
                            <span className="text-muted-foreground text-sm flex items-center gap-1">
                              <User className="size-3" />
                              {stop.customer_contact.name}
                            </span>
                          ) : null}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stopStatusColorMap[stop.status] ?? ""}`}
                        >
                          {t(stopStatusTranslationMap[stop.status] ?? "inventory.dispatch.stop_pending")}
                        </span>
                      </div>
                      {stop.delivery_address ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3" />
                          {[stop.delivery_address, stop.delivery_district, stop.delivery_canton, stop.delivery_province]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      ) : null}
                      {stop.received_by ? (
                        <p className="text-xs text-muted-foreground">
                          {t("inventory.dispatch.received_by")}: {stop.received_by}
                        </p>
                      ) : null}
                      {stop.failure_reason ? (
                        <p className="text-xs text-red-600">
                          {t("inventory.dispatch.failure_reason")}: {stop.failure_reason}
                        </p>
                      ) : null}
                      {stop.notes ? (
                        <p className="text-xs text-muted-foreground">{stop.notes}</p>
                      ) : null}
                      {/* Show update status button when order is dispatched/in_transit and stop is not resolved */}
                      {(order.status === "dispatched" || order.status === "in_transit") &&
                      (stop.status === "pending" || stop.status === "in_transit") ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1"
                          onClick={() => setStopStatusTarget(stop)}
                        >
                          {t("inventory.dispatch.update_stop_status")}
                        </Button>
                      ) : null}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Expenses Section */}
          {expenses.length > 0 ? (
            <>
              <Separator />
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Truck className="size-4" />
                  {t("inventory.dispatch.expenses")} ({expenses.length})
                </h3>
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {expense.expense_type.replace(/_/g, " ")}
                        </p>
                        {expense.description ? (
                          <p className="text-xs text-muted-foreground">
                            {expense.description}
                          </p>
                        ) : null}
                        {expense.receipt_number ? (
                          <p className="text-xs text-muted-foreground">
                            {t("inventory.dispatch.receipt")}: {expense.receipt_number}
                          </p>
                        ) : null}
                      </div>
                      <span className="font-medium tabular-nums">
                        {expense.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2 border-t">
                    <span className="text-sm font-semibold">
                      {t("inventory.dispatch.total_expenses")}:{" "}
                      {expenses
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          </SheetBody>
        </SheetContent>
      </Sheet>

      {stopStatusTarget && order ? (
        <UpdateStopStatusDialog
          orderId={String(order.id)}
          stop={stopStatusTarget}
          open={stopStatusTarget !== null}
          onOpenChange={(open) => {
            if (!open) setStopStatusTarget(null);
          }}
        />
      ) : null}
    </>
  );
}

export { DispatchOrderDetailDialog };
