import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Pencil, Trash2, XCircle } from "lucide-react";

import type { FrontendTranslationKey } from "@/shared/i18n/translations";
import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { formatDate } from "@/shared/lib/utils";

import type { SaleOrder } from "../types";

type GetSaleOrdersColumnsParams = {
  canUpdate: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  canDelete: boolean;
  onEdit: (order: SaleOrder) => void;
  onConfirm: (order: SaleOrder) => void;
  onCancel: (order: SaleOrder) => void;
  onDelete: (order: SaleOrder) => void;
  onViewDetail: (order: SaleOrder) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

const statusColorMap: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
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

const statusTranslationMap: Record<string, FrontendTranslationKey> = {
  draft: "sales.status_draft",
  confirmed: "sales.status_confirmed",
  cancelled: "sales.status_cancelled",
};

const fulfillmentTranslationMap: Record<string, FrontendTranslationKey> = {
  pickup: "sales.fulfillment_pickup",
  delivery: "sales.fulfillment_delivery",
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

function computeTotal(order: SaleOrder): number {
  const lines = order.lines ?? [];
  return lines.reduce((sum, line) => sum + (line.line_total ?? 0), 0);
}

function getSaleOrdersColumns({
  canUpdate,
  canConfirm,
  canCancel,
  canDelete,
  onEdit,
  onConfirm,
  onCancel,
  onDelete,
  onViewDetail,
  t,
}: GetSaleOrdersColumnsParams): ColumnDef<SaleOrder>[] {
  const baseColumns: ColumnDef<SaleOrder>[] = [
    {
      accessorKey: "code",
      header: t("sales.entity.sale_order"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <button
            className="font-medium text-primary hover:underline"
            onClick={() => onViewDetail(row.original)}
            type="button"
          >
            {row.original.code ?? "-"}
          </button>
          <p className="text-sm text-muted-foreground">
            {formatDate(row.original.order_date)}
          </p>
        </div>
      ),
    },
    {
      id: "customer",
      header: t("sales.customer"),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.customer_contact?.name ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t("sales.status"),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColorMap[row.original.status] ?? ""}`}
        >
          {t(statusTranslationMap[row.original.status] ?? "sales.status_draft")}
        </span>
      ),
    },
    {
      accessorKey: "fulfillment_mode",
      header: t("sales.fulfillment"),
      cell: ({ row }) => (
        <span className="text-sm">
          {t(fulfillmentTranslationMap[row.original.fulfillment_mode] ?? "sales.fulfillment_pickup")}
        </span>
      ),
    },
    {
      accessorKey: "dispatch_status",
      header: t("sales.dispatch_status"),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${dispatchColorMap[row.original.dispatch_status] ?? ""}`}
        >
          {t(dispatchTranslationMap[row.original.dispatch_status] ?? "sales.dispatch_not_required")}
        </span>
      ),
    },
    {
      id: "total",
      header: t("sales.total"),
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {computeTotal(row.original).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
  ];

  const hasActions = canUpdate || canConfirm || canCancel || canDelete;

  if (hasActions) {
    baseColumns.push({
      id: "actions",
      header: t("inventory.common.actions"),
      cell: ({ row }) => {
        const order = row.original;
        const lifecycle = order.lifecycle ?? {};

        return (
          <TableRowActions
            actions={[
              ...(canUpdate && lifecycle.can_edit
                ? [
                    {
                      label: t("inventory.common.edit"),
                      icon: Pencil,
                      onClick: () => onEdit(order),
                    },
                  ]
                : []),
              ...(canConfirm && lifecycle.can_confirm
                ? [
                    {
                      label: t("sales.confirm_order"),
                      icon: CheckCircle,
                      onClick: () => onConfirm(order),
                    },
                  ]
                : []),
              ...(canCancel && lifecycle.can_cancel
                ? [
                    {
                      label: t("sales.cancel_order"),
                      icon: XCircle,
                      variant: "destructive" as const,
                      onClick: () => onCancel(order),
                    },
                  ]
                : []),
              ...(canDelete && lifecycle.can_delete
                ? [
                    {
                      label: t("inventory.common.delete"),
                      icon: Trash2,
                      variant: "destructive" as const,
                      onClick: () => onDelete(order),
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    });
  }

  return baseColumns;
}

export { getSaleOrdersColumns };
