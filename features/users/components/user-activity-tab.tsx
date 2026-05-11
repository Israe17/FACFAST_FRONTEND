"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  Receipt,
  ShieldCheck,
  ShieldOff,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContactsQuery } from "@/features/contacts/queries";
import {
  listDispatchOrdersCursor,
  listInventoryMovementsCursor,
} from "@/features/inventory/api";
import {
  useProductsQuery,
  useRoutesQuery,
  useVehiclesQuery,
  useWarehousesQuery,
} from "@/features/inventory/queries";
import { listSaleOrdersCursor } from "@/features/sales/api";
import type { SaleOrder } from "@/features/sales/types";
import type { DispatchOrder } from "@/features/inventory/types";
import { DispatchOrderDetailDialog } from "@/features/inventory/components/dispatch-order-detail-dialog";
import { SaleOrderDetailDialog } from "@/features/sales/components/sale-order-detail-dialog";
import { InventoryMovementDetailSheet } from "@/features/inventory/components/inventory-movement-detail-sheet";
import {
  ActivityFiltersBar,
  type FilterField,
  type SelectOption,
} from "@/shared/components/activity-filters-bar";
import { ActivityList } from "@/shared/components/activity-list";
import { EmptyState } from "@/shared/components/empty-state";
import { useActivityCursorList } from "@/shared/hooks/use-activity-cursor-list";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { FrontendTranslationKey } from "@/shared/i18n/translations";

import { useAssignableBranchesQuery } from "../queries";
import type { User } from "../types";

type UserActivityTabProps = {
  user: User;
  enabled: boolean;
  onRequestTab?: (tab: string) => void;
};

type MovementsFilters = {
  branch_id?: string;
  from?: string;
  to?: string;
  status?: string;
  movement_type?: string;
  warehouse_id?: string;
  product_id?: string;
};

type SalesFilters = {
  branch_id?: string;
  from?: string;
  to?: string;
  status?: string;
  customer_contact_id?: string;
  warehouse_id?: string;
};

type DispatchFilters = {
  branch_id?: string;
  from?: string;
  to?: string;
  status?: string;
  dispatch_type?: string;
  vehicle_id?: string;
  driver_user_id?: string;
  route_id?: string;
};

const MOVEMENT_STATUS_VALUES = [
  "draft",
  "posted",
  "cancelled",
  "in_transit",
  "received",
  "partially_received",
] as const;

const MOVEMENT_TYPE_VALUES = [
  "purchase_receipt",
  "sales_dispatch",
  "sales_allocated",
  "stock_adjustment",
  "transfer",
  "manual_correction",
  "reservation",
  "release",
  "return_in",
  "return_out",
  "purchase_expected",
  "dispatch_cancelled",
  "dispatch_return",
] as const;

const SALE_ORDER_STATUS_VALUES = ["draft", "confirmed", "cancelled"] as const;

const DISPATCH_ORDER_STATUS_VALUES = [
  "draft",
  "ready",
  "dispatched",
  "in_transit",
  "completed",
  "cancelled",
] as const;

const DISPATCH_TYPE_VALUES = ["individual", "consolidated"] as const;

function toNumberFilter(value: string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function isFiltersDirty(
  filters: Record<string, string | undefined>,
): boolean {
  return Object.values(filters).some((value) => value !== undefined && value !== "");
}

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
  const [movementsFilters, setMovementsFilters] = useState<MovementsFilters>({});
  const [salesFilters, setSalesFilters] = useState<SalesFilters>({});
  const [dispatchFilters, setDispatchFilters] = useState<DispatchFilters>({});

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
            user={user}
            filters={movementsFilters}
            setFilters={setMovementsFilters}
            enabled={enabled && validUserId && activeSubTab === "movements"}
          />
        </TabsContent>
      ) : null}

      {showSales ? (
        <TabsContent value="sales" className="space-y-3">
          <SalesList
            user={user}
            filters={salesFilters}
            setFilters={setSalesFilters}
            enabled={enabled && validUserId && activeSubTab === "sales"}
          />
        </TabsContent>
      ) : null}

      {showDispatch ? (
        <TabsContent value="dispatch" className="space-y-3">
          <DispatchList
            user={user}
            filters={dispatchFilters}
            setFilters={setDispatchFilters}
            enabled={enabled && validUserId && activeSubTab === "dispatch"}
          />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}

function useBranchOptionsForUser(user: User, enabled: boolean): SelectOption[] {
  const branchesQuery = useAssignableBranchesQuery(enabled);
  return useMemo(() => {
    const userBranchIds = new Set(user.branch_ids.map(String));
    const catalog = branchesQuery.data ?? [];
    const filtered = userBranchIds.size
      ? catalog.filter((branch) => userBranchIds.has(String(branch.id)))
      : catalog;
    return filtered.map((branch) => ({
      value: String(branch.id),
      label: branch.name,
    }));
  }, [branchesQuery.data, user.branch_ids]);
}

function buildEnumOptions(
  values: readonly string[],
  translate: (value: string) => string,
): SelectOption[] {
  return values.map((value) => ({ value, label: translate(value) }));
}

type MovementsListProps = {
  user: User;
  filters: MovementsFilters;
  setFilters: (next: MovementsFilters) => void;
  enabled: boolean;
};

function MovementsList({
  user,
  filters,
  setFilters,
  enabled,
}: MovementsListProps) {
  const { t } = useAppTranslator();
  const userIdNumber = Number(user.id);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(
    null,
  );
  const branchOptions = useBranchOptionsForUser(user, enabled);
  const warehousesQuery = useWarehousesQuery(enabled);
  const productsQuery = useProductsQuery(enabled);

  const list = useActivityCursorList({
    baseQueryKey: ["users", userIdNumber, "activity", "inventory-movements"],
    filters,
    enabled,
    queryFn: ({ cursor, limit, search, filters: f }) =>
      listInventoryMovementsCursor(
        { cursor, limit, sort_order: "DESC", search },
        {
          performed_by_user_id: userIdNumber,
          branch_id: toNumberFilter(f.branch_id),
          warehouse_id: toNumberFilter(f.warehouse_id),
          product_id: toNumberFilter(f.product_id),
          from: f.from,
          to: f.to,
          status: f.status,
          movement_type: f.movement_type,
        },
      ),
  });

  const statusOptions = buildEnumOptions(MOVEMENT_STATUS_VALUES, (value) =>
    t(`users.activity.status.${value}` as FrontendTranslationKey),
  );
  const typeOptions = buildEnumOptions(MOVEMENT_TYPE_VALUES, (value) =>
    t(`users.activity.movement_type.${value}` as FrontendTranslationKey),
  );
  const warehouseOptions: SelectOption[] = (warehousesQuery.data ?? []).map(
    (warehouse) => ({ value: String(warehouse.id), label: warehouse.name }),
  );
  const productOptions: SelectOption[] = (productsQuery.data ?? []).map(
    (product) => ({ value: String(product.id), label: product.name }),
  );

  const fields: FilterField[] = [
    {
      key: "branch",
      label: t("users.activity.filters.branch_label"),
      options: branchOptions,
      value: filters.branch_id,
      onChange: (value) => setFilters({ ...filters, branch_id: value }),
    },
    {
      key: "status",
      label: t("users.activity.filters.status_label"),
      options: statusOptions,
      value: filters.status,
      onChange: (value) => setFilters({ ...filters, status: value }),
    },
    {
      key: "movement_type",
      label: t("users.activity.filters.movement_type_label"),
      options: typeOptions,
      value: filters.movement_type,
      onChange: (value) => setFilters({ ...filters, movement_type: value }),
    },
    {
      key: "warehouse",
      label: t("users.activity.filters.warehouse_label"),
      options: warehouseOptions,
      value: filters.warehouse_id,
      onChange: (value) => setFilters({ ...filters, warehouse_id: value }),
    },
    {
      key: "product",
      label: t("users.activity.filters.product_label"),
      options: productOptions,
      value: filters.product_id,
      onChange: (value) => setFilters({ ...filters, product_id: value }),
    },
  ];
  if (!branchOptions.length) {
    fields.shift();
  }

  const items = list.rawItems.map((movement) => ({
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
    <>
      <ActivityFiltersBar
        from={filters.from}
        to={filters.to}
        onDateRangeChange={({ from: nextFrom, to: nextTo }) =>
          setFilters({ ...filters, from: nextFrom, to: nextTo })
        }
        fields={fields}
        onClear={() => setFilters({})}
        isDirty={isFiltersDirty(filters)}
      />
      <ActivityList
        icon={ArrowRightLeft}
        loadingLabel={t("users.activity.loading_movements")}
        emptyTitle={t("users.activity.movements_empty_title")}
        emptyDescription={t("users.activity.movements_empty_description")}
        items={items}
        isLoading={list.isLoading}
        isFetching={list.isFetching}
        isError={list.isError}
        error={list.error}
        onRetry={list.refetch}
        hasNextPage={list.hasNextPage}
        hasPrevPage={list.hasPrevPage}
        onNextPage={list.onNextPage}
        onPrevPage={list.onPrevPage}
        pageNumber={list.pageNumber}
        total={list.total}
        pageSize={list.pageSize}
        onPageSizeChange={list.onPageSizeChange}
        search={list.search}
        onSearchChange={list.onSearchChange}
        onItemSelect={setSelectedMovementId}
      />
      <InventoryMovementDetailSheet
        movementId={selectedMovementId}
        onOpenChange={(open) => {
          if (!open) setSelectedMovementId(null);
        }}
      />
    </>
  );
}

type SalesListProps = {
  user: User;
  filters: SalesFilters;
  setFilters: (next: SalesFilters) => void;
  enabled: boolean;
};

function SalesList({ user, filters, setFilters, enabled }: SalesListProps) {
  const { t } = useAppTranslator();
  const userIdNumber = Number(user.id);
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const branchOptions = useBranchOptionsForUser(user, enabled);
  const warehousesQuery = useWarehousesQuery(enabled);
  const contactsQuery = useContactsQuery(enabled);

  const list = useActivityCursorList({
    baseQueryKey: ["users", userIdNumber, "activity", "sale-orders"],
    filters,
    enabled,
    queryFn: ({ cursor, limit, search, filters: f }) =>
      listSaleOrdersCursor(
        { cursor, limit, sort_order: "DESC", search },
        {
          created_by_user_id: userIdNumber,
          branch_id: toNumberFilter(f.branch_id),
          customer_contact_id: toNumberFilter(f.customer_contact_id),
          warehouse_id: toNumberFilter(f.warehouse_id),
          from: f.from,
          to: f.to,
          status: f.status,
        },
      ),
  });

  const statusOptions = buildEnumOptions(SALE_ORDER_STATUS_VALUES, (value) =>
    t(`users.activity.status.${value}` as FrontendTranslationKey),
  );
  const warehouseOptions: SelectOption[] = (warehousesQuery.data ?? []).map(
    (warehouse) => ({ value: String(warehouse.id), label: warehouse.name }),
  );
  const customerOptions: SelectOption[] = (contactsQuery.data ?? [])
    .filter(
      (contact) =>
        contact.type === undefined ||
        contact.type === "customer" ||
        contact.type === "both",
    )
    .map((contact) => ({ value: String(contact.id), label: contact.name }));

  const fields: FilterField[] = [
    {
      key: "branch",
      label: t("users.activity.filters.branch_label"),
      options: branchOptions,
      value: filters.branch_id,
      onChange: (value) => setFilters({ ...filters, branch_id: value }),
    },
    {
      key: "status",
      label: t("users.activity.filters.status_label"),
      options: statusOptions,
      value: filters.status,
      onChange: (value) => setFilters({ ...filters, status: value }),
    },
    {
      key: "customer",
      label: t("users.activity.filters.customer_label"),
      options: customerOptions,
      value: filters.customer_contact_id,
      onChange: (value) =>
        setFilters({ ...filters, customer_contact_id: value }),
    },
    {
      key: "warehouse",
      label: t("users.activity.filters.warehouse_label"),
      options: warehouseOptions,
      value: filters.warehouse_id,
      onChange: (value) => setFilters({ ...filters, warehouse_id: value }),
    },
  ];
  if (!branchOptions.length) {
    fields.shift();
  }

  const items = list.rawItems.map((order) => ({
    id: String(order.id),
    primary: order.code ?? `#${order.id}`,
    secondary: [order.customer_contact?.name ?? null, order.branch?.name ?? null]
      .filter(Boolean)
      .join(" · "),
    timestamp: order.order_date ?? order.created_at,
    badge: order.status ? String(order.status) : null,
  }));

  return (
    <>
      <ActivityFiltersBar
        from={filters.from}
        to={filters.to}
        onDateRangeChange={({ from: nextFrom, to: nextTo }) =>
          setFilters({ ...filters, from: nextFrom, to: nextTo })
        }
        fields={fields}
        onClear={() => setFilters({})}
        isDirty={isFiltersDirty(filters)}
      />
      <ActivityList
        icon={Receipt}
        loadingLabel={t("users.activity.loading_sales")}
        emptyTitle={t("users.activity.sales_empty_title")}
        emptyDescription={t("users.activity.sales_empty_description")}
        items={items}
        isLoading={list.isLoading}
        isFetching={list.isFetching}
        isError={list.isError}
        error={list.error}
        onRetry={list.refetch}
        hasNextPage={list.hasNextPage}
        hasPrevPage={list.hasPrevPage}
        onNextPage={list.onNextPage}
        onPrevPage={list.onPrevPage}
        pageNumber={list.pageNumber}
        total={list.total}
        pageSize={list.pageSize}
        onPageSizeChange={list.onPageSizeChange}
        search={list.search}
        onSearchChange={list.onSearchChange}
        onItemSelect={(id) => {
          const found = list.rawItems.find((order) => String(order.id) === id);
          if (found) setSelectedOrder(found);
        }}
      />
      <SaleOrderDetailDialog
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      />
    </>
  );
}

type DispatchListProps = {
  user: User;
  filters: DispatchFilters;
  setFilters: (next: DispatchFilters) => void;
  enabled: boolean;
};

function DispatchList({
  user,
  filters,
  setFilters,
  enabled,
}: DispatchListProps) {
  const { t } = useAppTranslator();
  const userIdNumber = Number(user.id);
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchOrder | null>(
    null,
  );
  const branchOptions = useBranchOptionsForUser(user, enabled);
  const vehiclesQuery = useVehiclesQuery(enabled);
  const routesQuery = useRoutesQuery(enabled);

  const list = useActivityCursorList({
    baseQueryKey: ["users", userIdNumber, "activity", "dispatch-orders"],
    filters,
    enabled,
    queryFn: ({ cursor, limit, search, filters: f }) =>
      listDispatchOrdersCursor(
        { cursor, limit, sort_order: "DESC", search },
        {
          created_by_user_id: userIdNumber,
          branch_id: toNumberFilter(f.branch_id),
          vehicle_id: toNumberFilter(f.vehicle_id),
          driver_user_id: toNumberFilter(f.driver_user_id),
          route_id: toNumberFilter(f.route_id),
          from: f.from,
          to: f.to,
          status: f.status,
          dispatch_type: f.dispatch_type,
        },
      ),
  });

  const statusOptions = buildEnumOptions(
    DISPATCH_ORDER_STATUS_VALUES,
    (value) => t(`users.activity.status.${value}` as FrontendTranslationKey),
  );
  const dispatchTypeOptions = buildEnumOptions(DISPATCH_TYPE_VALUES, (value) =>
    t(`users.activity.dispatch_type.${value}` as FrontendTranslationKey),
  );
  const vehicleOptions: SelectOption[] = (vehiclesQuery.data ?? []).map(
    (vehicle) => ({
      value: String(vehicle.id),
      label: vehicle.plate_number
        ? `${vehicle.name} (${vehicle.plate_number})`
        : vehicle.name,
    }),
  );
  const routeOptions: SelectOption[] = (routesQuery.data ?? []).map(
    (route) => ({ value: String(route.id), label: route.name }),
  );

  const fields: FilterField[] = [
    {
      key: "branch",
      label: t("users.activity.filters.branch_label"),
      options: branchOptions,
      value: filters.branch_id,
      onChange: (value) => setFilters({ ...filters, branch_id: value }),
    },
    {
      key: "status",
      label: t("users.activity.filters.status_label"),
      options: statusOptions,
      value: filters.status,
      onChange: (value) => setFilters({ ...filters, status: value }),
    },
    {
      key: "dispatch_type",
      label: t("users.activity.filters.dispatch_type_label"),
      options: dispatchTypeOptions,
      value: filters.dispatch_type,
      onChange: (value) => setFilters({ ...filters, dispatch_type: value }),
    },
    {
      key: "vehicle",
      label: t("users.activity.filters.vehicle_label"),
      options: vehicleOptions,
      value: filters.vehicle_id,
      onChange: (value) => setFilters({ ...filters, vehicle_id: value }),
    },
    {
      key: "route",
      label: t("users.activity.filters.route_label"),
      options: routeOptions,
      value: filters.route_id,
      onChange: (value) => setFilters({ ...filters, route_id: value }),
    },
  ];
  if (!branchOptions.length) {
    fields.shift();
  }

  const items = list.rawItems.map((order) => ({
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
    <>
      <ActivityFiltersBar
        from={filters.from}
        to={filters.to}
        onDateRangeChange={({ from: nextFrom, to: nextTo }) =>
          setFilters({ ...filters, from: nextFrom, to: nextTo })
        }
        fields={fields}
        onClear={() => setFilters({})}
        isDirty={isFiltersDirty(filters)}
      />
      <ActivityList
        icon={Truck}
        loadingLabel={t("users.activity.loading_dispatch")}
        emptyTitle={t("users.activity.dispatch_empty_title")}
        emptyDescription={t("users.activity.dispatch_empty_description")}
        items={items}
        isLoading={list.isLoading}
        isFetching={list.isFetching}
        isError={list.isError}
        error={list.error}
        onRetry={list.refetch}
        hasNextPage={list.hasNextPage}
        hasPrevPage={list.hasPrevPage}
        onNextPage={list.onNextPage}
        onPrevPage={list.onPrevPage}
        pageNumber={list.pageNumber}
        total={list.total}
        pageSize={list.pageSize}
        onPageSizeChange={list.onPageSizeChange}
        search={list.search}
        onSearchChange={list.onSearchChange}
        onItemSelect={(id) => {
          const found = list.rawItems.find((order) => String(order.id) === id);
          if (found) setSelectedDispatch(found);
        }}
      />
      <DispatchOrderDetailDialog
        order={selectedDispatch}
        open={Boolean(selectedDispatch)}
        onOpenChange={(open) => {
          if (!open) setSelectedDispatch(null);
        }}
      />
    </>
  );
}
