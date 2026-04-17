"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, MapPin, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { SaleOrder, SaleOrderLine } from "@/features/sales/types";

function ProductLinesExpander({ lines, t }: { lines: SaleOrderLine[]; t: ReturnType<typeof useAppTranslator>["t"] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
      >
        <Package className="size-3" />
        {lines.length} {t("inventory.dispatch.product")}
        <ChevronDown className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded ? (
        <div className="rounded border bg-muted/30 text-xs">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left font-medium">{t("inventory.dispatch.product")}</th>
                <th className="px-2 py-1 text-right font-medium w-10">{t("inventory.dispatch.ordered")}</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b last:border-b-0">
                  <td className="px-2 py-1 truncate max-w-[140px]">
                    {line.product_variant?.product?.name ?? line.product_variant?.sku ?? `#${line.product_variant_id}`}
                  </td>
                  <td className="px-2 py-1 text-right tabular-nums">{line.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}

type PendingOrderCardProps = {
  order: SaleOrder;
  isSelected: boolean;
  isHighlighted: boolean;
  onToggleSelect: (orderId: string) => void;
  onHighlight: (orderId: string | null) => void;
  onAssign: (orderId: string) => void;
};

function PendingOrderCard({
  order,
  isSelected,
  isHighlighted,
  onToggleSelect,
  onHighlight,
  onAssign,
}: PendingOrderCardProps) {
  const { t } = useAppTranslator();

  const orderId = String(order.id);

  const totalAmount = useMemo(() => {
    return (order.lines ?? []).reduce((sum, line) => sum + (line.line_total ?? 0), 0);
  }, [order.lines]);

  const deliveryAddress = useMemo(() => {
    return [order.delivery_address, order.delivery_district, order.delivery_canton, order.delivery_province]
      .filter(Boolean)
      .join(", ");
  }, [order.delivery_address, order.delivery_district, order.delivery_canton, order.delivery_province]);

  const dateBadge = useMemo(() => {
    if (!order.delivery_requested_date) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reqDate = new Date(order.delivery_requested_date);
    reqDate.setHours(0, 0, 0, 0);

    const isToday = reqDate.getTime() === today.getTime();
    const isOverdue = reqDate.getTime() < today.getTime();

    return {
      label: reqDate.toLocaleDateString(),
      className: isOverdue
        ? "bg-red-100 text-red-800"
        : isToday
          ? "bg-amber-100 text-amber-800"
          : "bg-gray-100 text-gray-800",
    };
  }, [order.delivery_requested_date]);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`border-l-4 border-l-orange-400 rounded-md border p-2.5 transition-colors cursor-pointer ${
        isSelected ? "bg-accent" : isHighlighted ? "bg-muted/60" : "hover:bg-muted/40"
      }`}
      onClick={() => onHighlight(isHighlighted ? null : orderId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onHighlight(isHighlighted ? null : orderId);
        }
      }}
    >
      <div className="flex items-start gap-2">
        {/* Checkbox */}
        <div
          className="pt-0.5"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(orderId)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Code + Customer */}
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-medium truncate">
              {order.code ?? `OV-${order.id}`}
            </span>
            {order.customer_contact ? (
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {order.customer_contact.name}
              </span>
            ) : null}
          </div>

          {/* Delivery address */}
          {deliveryAddress ? (
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              {deliveryAddress}
            </p>
          ) : null}

          {/* Zone + Date + Amount row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {order.delivery_zone ? (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {order.delivery_zone.name}
              </Badge>
            ) : null}

            {dateBadge ? (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[10px] font-medium ${dateBadge.className}`}
              >
                <CalendarDays className="size-2.5" />
                {dateBadge.label}
              </span>
            ) : null}

            <span className="ml-auto text-xs font-medium tabular-nums">
              {totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Product lines expandable */}
          {(order.lines?.length ?? 0) > 0 ? (
            <ProductLinesExpander lines={order.lines!} t={t} />
          ) : null}

          {/* Assign button */}
          <div className="flex justify-end pt-0.5">
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs px-2"
              onClick={(e) => {
                e.stopPropagation();
                onAssign(orderId);
              }}
            >
              {t("inventory.dispatch.assign_to")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PendingOrderCard };
