"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  ClipboardList,
  Receipt,
  ShieldOff,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { listDispatchOrdersCursor, listInventoryMovementsCursor } from "@/features/inventory/api";
import { listSaleOrdersCursor } from "@/features/sales/api";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { formatDateTime } from "@/shared/lib/utils";

type UserActivityTabProps = {
  userId: string;
  enabled: boolean;
};

const ACTIVITY_PAGE_SIZE = 10;

export function UserActivityTab({ userId, enabled }: UserActivityTabProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();

  const canViewMovements = can("inventory_movements.view");
  const canViewSales = can("sale_orders.view");
  const canViewDispatch = can("dispatch_orders.view");

  const userIdNumber = Number(userId);
  const validUserId = Number.isFinite(userIdNumber) && userIdNumber > 0;

  const movementsQuery = useQuery({
    enabled: enabled && validUserId && canViewMovements,
    queryKey: ["users", userId, "activity", "inventory-movements"],
    queryFn: () =>
      listInventoryMovementsCursor(
        { limit: ACTIVITY_PAGE_SIZE },
        { performed_by_user_id: userIdNumber },
      ),
  });

  const salesQuery = useQuery({
    enabled: enabled && validUserId && canViewSales,
    queryKey: ["users", userId, "activity", "sale-orders"],
    queryFn: () =>
      listSaleOrdersCursor(
        { limit: ACTIVITY_PAGE_SIZE },
        { created_by_user_id: userIdNumber },
      ),
  });

  const dispatchQuery = useQuery({
    enabled: enabled && validUserId && canViewDispatch,
    queryKey: ["users", userId, "activity", "dispatch-orders"],
    queryFn: () =>
      listDispatchOrdersCursor(
        { limit: ACTIVITY_PAGE_SIZE },
        { created_by_user_id: userIdNumber },
      ),
  });

  if (!canViewMovements && !canViewSales && !canViewDispatch) {
    return (
      <EmptyState
        icon={ShieldOff}
        title={t("users.activity.permission_required_title")}
        description={t("users.activity.permission_required_description")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {canViewMovements ? (
        <ActivitySection
          icon={ArrowRightLeft}
          title={t("users.activity.movements_title")}
          loadingLabel={t("users.activity.loading_movements")}
          emptyTitle={t("users.activity.movements_empty_title")}
          emptyDescription={t("users.activity.movements_empty_description")}
          isLoading={movementsQuery.isLoading}
          isError={movementsQuery.isError}
          error={movementsQuery.error}
          onRetry={() => movementsQuery.refetch()}
          items={(movementsQuery.data?.data ?? []).map((movement) => ({
            id: movement.id,
            primary: movement.code ?? `#${movement.id}`,
            secondary: [
              movement.movement_type ? String(movement.movement_type) : null,
              movement.status ? String(movement.status) : null,
              movement.branch?.name ?? null,
            ]
              .filter(Boolean)
              .join(" · "),
            timestamp: movement.occurred_at ?? movement.created_at,
            badge: movement.status ? String(movement.status) : null,
          }))}
        />
      ) : null}

      {canViewSales ? (
        <ActivitySection
          icon={Receipt}
          title={t("users.activity.sales_title")}
          loadingLabel={t("users.activity.loading_sales")}
          emptyTitle={t("users.activity.sales_empty_title")}
          emptyDescription={t("users.activity.sales_empty_description")}
          isLoading={salesQuery.isLoading}
          isError={salesQuery.isError}
          error={salesQuery.error}
          onRetry={() => salesQuery.refetch()}
          items={(salesQuery.data?.data ?? []).map((order) => ({
            id: order.id,
            primary: order.code ?? `#${order.id}`,
            secondary: [
              order.customer_contact?.name ?? null,
              order.branch?.name ?? null,
            ]
              .filter(Boolean)
              .join(" · "),
            timestamp: order.order_date ?? order.created_at,
            badge: order.status ? String(order.status) : null,
          }))}
        />
      ) : null}

      {canViewDispatch ? (
        <ActivitySection
          icon={Truck}
          title={t("users.activity.dispatch_title")}
          loadingLabel={t("users.activity.loading_dispatch")}
          emptyTitle={t("users.activity.dispatch_empty_title")}
          emptyDescription={t("users.activity.dispatch_empty_description")}
          isLoading={dispatchQuery.isLoading}
          isError={dispatchQuery.isError}
          error={dispatchQuery.error}
          onRetry={() => dispatchQuery.refetch()}
          items={(dispatchQuery.data?.data ?? []).map((order) => ({
            id: order.id,
            primary: order.code ?? `#${order.id}`,
            secondary: [
              order.dispatch_type ? String(order.dispatch_type) : null,
              order.branch?.name ?? null,
              order.route?.name ?? null,
            ]
              .filter(Boolean)
              .join(" · "),
            timestamp: order.scheduled_date ?? order.dispatched_at ?? null,
            badge: order.status ? String(order.status) : null,
          }))}
        />
      ) : null}
    </div>
  );
}

type ActivityItem = {
  id: string;
  primary: string;
  secondary: string;
  timestamp?: string | null;
  badge?: string | null;
};

type ActivitySectionProps = {
  icon: LucideIcon;
  title: string;
  loadingLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  items: ActivityItem[];
};

function ActivitySection({
  icon: Icon,
  title,
  loadingLabel,
  emptyTitle,
  emptyDescription,
  isLoading,
  isError,
  error,
  onRetry,
  items,
}: ActivitySectionProps) {
  const { t } = useAppTranslator();
  return (
    <section className="space-y-2 rounded-2xl border border-border/70 bg-background p-3">
      <header className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
        {!isLoading && !isError ? (
          <Badge variant="outline" className="ml-auto">
            {items.length}
          </Badge>
        ) : null}
      </header>

      {isLoading ? <LoadingState description={loadingLabel} /> : null}
      {isError ? (
        <ErrorState
          description={getBackendErrorMessage(error, t("common.load_failed"))}
          onRetry={onRetry}
        />
      ) : null}
      {!isLoading && !isError && items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : null}
      {!isLoading && !isError && items.length ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-sm font-medium">{item.primary}</p>
                {item.secondary ? (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.secondary}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {item.badge ? (
                  <Badge variant="outline" className="capitalize">
                    {item.badge}
                  </Badge>
                ) : null}
                {item.timestamp ? (
                  <span className="text-[10px] text-muted-foreground">
                    {formatDateTime(item.timestamp)}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
