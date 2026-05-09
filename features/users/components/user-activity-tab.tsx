"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  ClipboardList,
  Loader2,
  Receipt,
  ShieldCheck,
  ShieldOff,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listDispatchOrdersCursor, listInventoryMovementsCursor } from "@/features/inventory/api";
import { listSaleOrdersCursor } from "@/features/sales/api";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useCursorQuery } from "@/shared/hooks/use-cursor-query";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { formatDateTime } from "@/shared/lib/utils";

import { useAssignableBranchesQuery } from "../queries";
import type { User } from "../types";

type UserActivityTabProps = {
  user: User;
  enabled: boolean;
  onRequestTab?: (tab: string) => void;
};

const ACTIVITY_PAGE_SIZE = 20;
const BRANCH_FILTER_ALL = "all";

export function UserActivityTab({
  user,
  enabled,
  onRequestTab,
}: UserActivityTabProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();

  const viewerCanViewMovements = can("inventory_movements.view");
  const viewerCanViewSales = can("sale_orders.view");
  const viewerCanViewDispatch = can("dispatch_orders.view");
  const isPrivileged = user.is_platform_admin || user.user_type === "owner";

  // The target user can only have produced records of a given kind if their
  // effective permissions include at least one perform action for it.
  // Owners and platform admins are treated as universally privileged.
  const targetPermissions = new Set(user.effective_permissions ?? []);
  const targetCanPerformMovements =
    isPrivileged ||
    targetPermissions.has("inventory_movements.adjust") ||
    targetPermissions.has("inventory_movements.transfer") ||
    targetPermissions.has("inventory_movements.cancel");
  const targetCanPerformSales =
    isPrivileged || targetPermissions.has("sale_orders.create");
  const targetCanPerformDispatch =
    isPrivileged || targetPermissions.has("dispatch_orders.create");

  const showMovements = viewerCanViewMovements && targetCanPerformMovements;
  const showSales = viewerCanViewSales && targetCanPerformSales;
  const showDispatch = viewerCanViewDispatch && targetCanPerformDispatch;

  const userIdNumber = Number(user.id);
  const validUserId = Number.isFinite(userIdNumber) && userIdNumber > 0;

  const initialSubTab = showMovements
    ? "movements"
    : showSales
      ? "sales"
      : showDispatch
        ? "dispatch"
        : "movements";

  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab);
  const [branchFilter, setBranchFilter] = useState<string>(BRANCH_FILTER_ALL);

  const branchesQuery = useAssignableBranchesQuery(enabled);
  const branchOptions = branchesQuery.data ?? [];
  const branchIdNumber =
    branchFilter === BRANCH_FILTER_ALL ? undefined : Number(branchFilter);
  const validBranchFilter =
    branchIdNumber === undefined ||
    (Number.isFinite(branchIdNumber) && branchIdNumber > 0);

  if (!viewerCanViewMovements && !viewerCanViewSales && !viewerCanViewDispatch) {
    return (
      <EmptyState
        icon={ShieldOff}
        title={t("users.activity.permission_required_title")}
        description={t("users.activity.permission_required_description")}
      />
    );
  }

  const hasNoRoles = user.roles.length === 0 && user.role_ids.length === 0;
  const hasNoBranches = user.branch_ids.length === 0;

  if (hasNoRoles && !user.is_platform_admin) {
    return (
      <EmptyState
        icon={ShieldOff}
        title={t("users.activity.no_roles_title")}
        description={t("users.activity.no_roles_description", {
          name: user.name,
        })}
        action={
          can("users.assign_roles") && onRequestTab ? (
            <Button onClick={() => onRequestTab("roles")} size="sm">
              <ShieldCheck className="size-4" />
              {t("users.activity.assign_roles_action")}
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (!showMovements && !showSales && !showDispatch) {
    return (
      <EmptyState
        icon={ShieldOff}
        title={t("users.activity.no_actionable_perms_title")}
        description={t("users.activity.no_actionable_perms_description", {
          name: user.name,
        })}
        action={
          can("users.assign_roles") && onRequestTab ? (
            <Button onClick={() => onRequestTab("roles")} size="sm">
              <ShieldCheck className="size-4" />
              {t("users.activity.assign_roles_action")}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
      <div className="flex flex-wrap items-center gap-2">
        <TabsList>
          {showMovements ? (
            <TabsTrigger value="movements">
              {t("users.activity.movements_title")}
            </TabsTrigger>
          ) : null}
          {showSales ? (
            <TabsTrigger value="sales">
              {t("users.activity.sales_title")}
            </TabsTrigger>
          ) : null}
          {showDispatch ? (
            <TabsTrigger value="dispatch">
              {t("users.activity.dispatch_title")}
            </TabsTrigger>
          ) : null}
        </TabsList>

        {hasNoBranches ? null : (
          <div className="ml-auto flex items-center gap-2">
            <Building2
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="h-9 w-[14rem]">
                <SelectValue
                  placeholder={t("users.activity.branch_filter_placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BRANCH_FILTER_ALL}>
                  {t("users.activity.branch_filter_all")}
                </SelectItem>
                {branchOptions
                  .filter((branch) =>
                    user.branch_ids.some((id) => String(id) === String(branch.id)),
                  )
                  .map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {hasNoBranches && !isPrivileged ? (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div className="flex-1 space-y-2">
              <p>
                {t("users.activity.no_branches_warning", { name: user.name })}
              </p>
              {can("users.assign_branches") && onRequestTab ? (
                <Button
                  onClick={() => onRequestTab("branches")}
                  size="sm"
                  variant="outline"
                >
                  {t("users.activity.assign_branches_action")}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showMovements ? (
        <TabsContent value="movements" className="space-y-3">
          <MovementsList
            userId={userIdNumber}
            branchId={branchIdNumber}
            enabled={
              enabled &&
              validUserId &&
              validBranchFilter &&
              activeSubTab === "movements"
            }
          />
        </TabsContent>
      ) : null}

      {showSales ? (
        <TabsContent value="sales" className="space-y-3">
          <SalesList
            userId={userIdNumber}
            branchId={branchIdNumber}
            enabled={
              enabled &&
              validUserId &&
              validBranchFilter &&
              activeSubTab === "sales"
            }
          />
        </TabsContent>
      ) : null}

      {showDispatch ? (
        <TabsContent value="dispatch" className="space-y-3">
          <DispatchList
            userId={userIdNumber}
            branchId={branchIdNumber}
            enabled={
              enabled &&
              validUserId &&
              validBranchFilter &&
              activeSubTab === "dispatch"
            }
          />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}

type ListProps = {
  userId: number;
  branchId: number | undefined;
  enabled: boolean;
};

function MovementsList({ userId, branchId, enabled }: ListProps) {
  const { t } = useAppTranslator();
  const query = useCursorQuery({
    queryKey: [
      "users",
      userId,
      "activity",
      "inventory-movements",
      branchId ?? "all",
    ],
    queryFn: (params) =>
      listInventoryMovementsCursor(params, {
        performed_by_user_id: userId,
        branch_id: branchId,
      }),
    limit: ACTIVITY_PAGE_SIZE,
    sortOrder: "DESC",
    enabled,
  });

  const items = query.data.map((movement) => ({
    id: String(movement.id),
    primary: movement.code ?? `#${movement.id}`,
    secondary: [
      movement.movement_type ? String(movement.movement_type) : null,
      movement.branch?.name ?? null,
      movement.notes ?? null,
    ]
      .filter(Boolean)
      .join(" · "),
    timestamp: movement.occurred_at ?? movement.created_at,
    badge: movement.status ? String(movement.status) : null,
  }));

  return (
    <ActivityList
      icon={ArrowRightLeft}
      loadingLabel={t("users.activity.loading_movements")}
      emptyTitle={t("users.activity.movements_empty_title")}
      emptyDescription={t("users.activity.movements_empty_description")}
      items={items}
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => query.refetch()}
      hasNextPage={Boolean(query.hasNextPage)}
      isFetchingNextPage={query.isFetchingNextPage}
      onLoadMore={() => query.fetchNextPage()}
    />
  );
}

function SalesList({ userId, branchId, enabled }: ListProps) {
  const { t } = useAppTranslator();
  const query = useCursorQuery({
    queryKey: [
      "users",
      userId,
      "activity",
      "sale-orders",
      branchId ?? "all",
    ],
    queryFn: (params) =>
      listSaleOrdersCursor(params, {
        created_by_user_id: userId,
        branch_id: branchId,
      }),
    limit: ACTIVITY_PAGE_SIZE,
    sortOrder: "DESC",
    enabled,
  });

  const items = query.data.map((order) => ({
    id: String(order.id),
    primary: order.code ?? `#${order.id}`,
    secondary: [
      order.customer_contact?.name ?? null,
      order.branch?.name ?? null,
    ]
      .filter(Boolean)
      .join(" · "),
    timestamp: order.order_date ?? order.created_at,
    badge: order.status ? String(order.status) : null,
  }));

  return (
    <ActivityList
      icon={Receipt}
      loadingLabel={t("users.activity.loading_sales")}
      emptyTitle={t("users.activity.sales_empty_title")}
      emptyDescription={t("users.activity.sales_empty_description")}
      items={items}
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => query.refetch()}
      hasNextPage={Boolean(query.hasNextPage)}
      isFetchingNextPage={query.isFetchingNextPage}
      onLoadMore={() => query.fetchNextPage()}
    />
  );
}

function DispatchList({ userId, branchId, enabled }: ListProps) {
  const { t } = useAppTranslator();
  const query = useCursorQuery({
    queryKey: [
      "users",
      userId,
      "activity",
      "dispatch-orders",
      branchId ?? "all",
    ],
    queryFn: (params) =>
      listDispatchOrdersCursor(params, {
        created_by_user_id: userId,
        branch_id: branchId,
      }),
    limit: ACTIVITY_PAGE_SIZE,
    sortOrder: "DESC",
    enabled,
  });

  const items = query.data.map((order) => ({
    id: String(order.id),
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
  }));

  return (
    <ActivityList
      icon={Truck}
      loadingLabel={t("users.activity.loading_dispatch")}
      emptyTitle={t("users.activity.dispatch_empty_title")}
      emptyDescription={t("users.activity.dispatch_empty_description")}
      items={items}
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => query.refetch()}
      hasNextPage={Boolean(query.hasNextPage)}
      isFetchingNextPage={query.isFetchingNextPage}
      onLoadMore={() => query.fetchNextPage()}
    />
  );
}

type ActivityItem = {
  id: string;
  primary: string;
  secondary: string;
  timestamp?: string | null;
  badge?: string | null;
};

type ActivityListProps = {
  icon: LucideIcon;
  loadingLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  items: ActivityItem[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

function ActivityList({
  icon: Icon,
  loadingLabel,
  emptyTitle,
  emptyDescription,
  items,
  isLoading,
  isError,
  error,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ActivityListProps) {
  const { t } = useAppTranslator();

  if (isLoading) {
    return <LoadingState description={loadingLabel} />;
  }

  if (isError) {
    return (
      <ErrorState
        description={getBackendErrorMessage(error, t("common.load_failed"))}
        onRetry={onRetry}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground">
        {t("users.activity.loaded_count", { count: String(items.length) })}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
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

      {hasNextPage ? (
        <div className="flex justify-center pt-1">
          <Button
            disabled={isFetchingNextPage}
            onClick={onLoadMore}
            size="sm"
            variant="outline"
          >
            {isFetchingNextPage ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isFetchingNextPage
              ? t("users.activity.loading_more")
              : t("users.activity.load_more")}
          </Button>
        </div>
      ) : (
        <p className="pt-1 text-center text-[10px] text-muted-foreground">
          {t("users.activity.end_of_list")}
        </p>
      )}
    </div>
  );
}
