"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { FormErrorBanner } from "@/shared/components/form-error-banner";

import type { SaleOrder } from "@/features/sales/types";

import type { DispatchOrder } from "../types";
import { useAddDispatchStopMutation } from "../queries";

type AddDispatchStopDialogProps = {
  dispatchOrder: DispatchOrder;
  pendingOrders: SaleOrder[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function AddDispatchStopDialog({
  dispatchOrder,
  pendingOrders,
  open,
  onOpenChange,
}: AddDispatchStopDialogProps) {
  const { t } = useAppTranslator();
  const mutation = useAddDispatchStopMutation(String(dispatchOrder.id), {
    showErrorToast: false,
  });

  const nextSequence = (dispatchOrder.stops?.length ?? 0) + 1;
  const [saleOrderSearch, setSaleOrderSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");

  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors({ clearErrors: () => {}, setError: () => {} });

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setNotes("");
      setSaleOrderSearch("");
      resetBackendFormErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dispatchOrder.id]);

  const filteredPendingOrders = useMemo(() => {
    const q = saleOrderSearch.trim().toLowerCase();
    if (!q) return pendingOrders;
    return pendingOrders.filter(
      (o) =>
        o.code?.toLowerCase().includes(q) ||
        o.customer_contact?.name?.toLowerCase().includes(q) ||
        o.delivery_address?.toLowerCase().includes(q) ||
        o.delivery_zone?.name?.toLowerCase().includes(q),
    );
  }, [pendingOrders, saleOrderSearch]);

  function toggleId(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (selectedIds.size === 0) return;
    resetBackendFormErrors();
    try {
      let seq = nextSequence;
      const trimmedNotes = notes.trim() ? notes.trim() : undefined;
      for (const saleOrderId of selectedIds) {
        await mutation.mutateAsync({
          sale_order_id: saleOrderId,
          delivery_sequence: seq++,
          notes: trimmedNotes,
        });
      }
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("inventory.dispatch_stop_create_error_fallback"),
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="sm" className="flex flex-col gap-0 p-0">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle>{t("inventory.dispatch.add_stop")}</SheetTitle>
          <SheetDescription>
            {dispatchOrder.code ?? `DO-${dispatchOrder.id}`} —{" "}
            {t("inventory.dispatch.add_stop_description")}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 py-3 border-b shrink-0 space-y-2">
          <FormErrorBanner message={formError} />
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              className="h-8 text-xs pl-7"
              placeholder={t("inventory.dispatch.search_sale_orders_placeholder")}
              value={saleOrderSearch}
              onChange={(e) => setSaleOrderSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filteredPendingOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("inventory.dispatch.no_eligible_orders")}
            </p>
          ) : (
            filteredPendingOrders.map((order) => {
              const id = String(order.id);
              const isSelected = selectedIds.has(id);
              const deliveryAddress = [
                order.delivery_address,
                order.delivery_district,
                order.delivery_canton,
              ]
                .filter(Boolean)
                .join(", ");
              const dateLabel = order.delivery_requested_date
                ? new Date(order.delivery_requested_date).toLocaleDateString()
                : null;

              return (
                <div
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  className={`border-l-4 border-l-orange-400 rounded-md border p-2.5 transition-colors cursor-pointer ${
                    isSelected ? "bg-accent" : "hover:bg-muted/40"
                  }`}
                  onClick={() => toggleId(id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleId(id);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="pt-0.5"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleId(id)}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium truncate">
                          {order.code ?? `OV-${order.id}`}
                        </span>
                        {order.customer_contact?.name ? (
                          <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                            {order.customer_contact.name}
                          </span>
                        ) : null}
                      </div>
                      {deliveryAddress ? (
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <MapPin className="size-3 shrink-0" />
                          {deliveryAddress}
                        </p>
                      ) : null}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.delivery_zone ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {order.delivery_zone.name}
                          </Badge>
                        ) : null}
                        {dateLabel ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[10px] font-medium bg-gray-100 text-gray-800">
                            <CalendarDays className="size-2.5" />
                            {dateLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t bg-background px-4 py-3 shrink-0 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t("inventory.common.notes")}</Label>
            <Textarea
              className="min-h-[60px] text-xs"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {selectedIds.size > 0
                ? t("inventory.dispatch.assign_selected", {
                    count: selectedIds.size,
                  })
                : null}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={selectedIds.size === 0 || mutation.isPending}
                onClick={handleSubmit}
              >
                {mutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { AddDispatchStopDialog };
