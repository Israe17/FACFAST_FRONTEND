import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle, ClipboardCheck, Pencil, Send, Trash2, XCircle } from "lucide-react";

import type { FrontendTranslationKey } from "@/shared/i18n/translations";
import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateTime } from "@/shared/lib/utils";

import type { DispatchOrder } from "../types";

type GetDispatchOrdersColumnsParams = {
  canUpdate: boolean;
  canCancel: boolean;
  canDelete: boolean;
  onEdit: (order: DispatchOrder) => void;
  onReady: (order: DispatchOrder) => void;
  onDispatch: (order: DispatchOrder) => void;
  onComplete: (order: DispatchOrder) => void;
  onCancel: (order: DispatchOrder) => void;
  onDelete: (order: DispatchOrder) => void;
  onViewDetail: (order: DispatchOrder) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
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

const typeTranslationMap: Record<string, FrontendTranslationKey> = {
  individual: "inventory.dispatch.type_individual",
  consolidated: "inventory.dispatch.type_consolidated",
};

function getDispatchOrdersColumns({
  canUpdate,
  canCancel,
  canDelete,
  onEdit,
  onReady,
  onDispatch,
  onComplete,
  onCancel,
  onDelete,
  onViewDetail,
  t,
}: GetDispatchOrdersColumnsParams): ColumnDef<DispatchOrder>[] {
  const baseColumns: ColumnDef<DispatchOrder>[] = [
    {
      accessorKey: "code",
      header: t("inventory.entity.dispatch_order"),
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
            {row.original.scheduled_date
              ? formatDateTime(row.original.scheduled_date)
              : "-"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "dispatch_type",
      header: t("inventory.dispatch.dispatch_type"),
      cell: ({ row }) => (
        <span className="text-sm">
          {t(typeTranslationMap[row.original.dispatch_type] ?? "inventory.dispatch.type_individual")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t("inventory.dispatch.status"),
      cell: ({ row }) => {
        const order = row.original;
        const readiness = order.lifecycle?.readiness;
        const hasMissing =
          order.status === "draft" &&
          readiness &&
          (readiness.missing_scheduled_date ||
            readiness.missing_vehicle ||
            readiness.missing_driver ||
            readiness.missing_stops ||
            readiness.has_date_conflicts);

        const missingItems: string[] = [];
        if (hasMissing && readiness) {
          if (readiness.missing_scheduled_date) missingItems.push(t("inventory.dispatch.readiness_scheduled_date"));
          if (readiness.missing_vehicle) missingItems.push(t("inventory.dispatch.readiness_vehicle"));
          if (readiness.missing_driver) missingItems.push(t("inventory.dispatch.readiness_driver"));
          if (readiness.missing_stops) missingItems.push(t("inventory.dispatch.readiness_stops"));
          if (readiness.has_date_conflicts) missingItems.push(t("inventory.dispatch.readiness_date_conflicts"));
        }

        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColorMap[order.status] ?? ""}`}
            >
              {t(statusTranslationMap[order.status] ?? "inventory.dispatch.status_draft")}
            </span>
            {hasMissing ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="size-4 text-amber-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="font-medium mb-1">{t("inventory.dispatch.readiness_title")}</p>
                  <ul className="text-xs space-y-0.5">
                    {missingItems.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "route",
      header: t("inventory.dispatch.route"),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.route?.name ?? "-"}</span>
      ),
    },
    {
      id: "vehicle",
      header: t("inventory.dispatch.vehicle"),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.vehicle?.name ?? "-"}</span>
      ),
    },
    {
      id: "driver",
      header: t("inventory.dispatch.driver"),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.driver_user?.name ?? "-"}</span>
      ),
    },
    {
      id: "stops",
      header: t("inventory.dispatch.stops"),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {(row.original.stops ?? []).length}
        </span>
      ),
    },
  ];

  const hasActions = canUpdate || canCancel || canDelete;

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
              ...(canUpdate && lifecycle.can_ready
                ? [
                    {
                      label: t("inventory.dispatch.mark_ready"),
                      icon: ClipboardCheck,
                      onClick: () => onReady(order),
                    },
                  ]
                : []),
              ...(canUpdate && lifecycle.can_dispatch
                ? [
                    {
                      label: t("inventory.dispatch.mark_dispatched"),
                      icon: Send,
                      onClick: () => onDispatch(order),
                    },
                  ]
                : []),
              ...(canUpdate && lifecycle.can_complete
                ? [
                    {
                      label: t("inventory.dispatch.mark_completed"),
                      icon: CheckCircle,
                      onClick: () => onComplete(order),
                    },
                  ]
                : []),
              ...(canCancel && lifecycle.can_cancel
                ? [
                    {
                      label: t("inventory.dispatch.cancel"),
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

export { getDispatchOrdersColumns };
