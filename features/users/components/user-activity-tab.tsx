"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  Receipt,
  Search,
  ShieldCheck,
  ShieldOff,
  Truck,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { InventoryMovementDetailSheet } from "./inventory-movement-detail-sheet";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { formatDateTime } from "@/shared/lib/utils";

import type { FrontendTranslationKey } from "@/shared/i18n/translations";

import { useAssignableBranchesQuery } from "../queries";
import type { User } from "../types";
import {
  ActivityFiltersBar,
  type FilterField,
  type SelectOption,
} from "./activity-filters-bar";

type UserActivityTabProps = {
  user: User;
  enabled: boolean;
  onRequestTab?: (tab: string) => void;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
const DEFAULT_PAGE_SIZE: PageSize = 20;

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
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<(number | undefined)[]>([]);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);

  // Reset pagination when filters, search, or page size change.
  const filtersKey = JSON.stringify({ filters, search: debouncedSearch });
  const [lastFiltersKey, setLastFiltersKey] = useState(filtersKey);
  const [lastPageSize, setLastPageSize] = useState(pageSize);
  if (filtersKey !== lastFiltersKey || pageSize !== lastPageSize) {
    setLastFiltersKey(filtersKey);
    setLastPageSize(pageSize);
    setCursor(undefined);
    setCursorStack([]);
  }

  const pageNumber = cursorStack.length + 1;
  const branchOptions = useBranchOptionsForUser(user, enabled);
  const warehousesQuery = useWarehousesQuery(enabled);
  const productsQuery = useProductsQuery(enabled);

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

  const query = useQuery({
    queryKey: ["users", userIdNumber, "activity", "inventory-movements", filters, pageSize, debouncedSearch, cursor],
    queryFn: () =>
      listInventoryMovementsCursor(
        { cursor, limit: pageSize, sort_order: "DESC", search: debouncedSearch || undefined },
        {
          performed_by_user_id: userIdNumber,
          branch_id: toNumberFilter(filters.branch_id),
          warehouse_id: toNumberFilter(filters.warehouse_id),
          product_id: toNumberFilter(filters.product_id),
          from: filters.from,
          to: filters.to,
          status: filters.status,
          movement_type: filters.movement_type,
        },
      ),
    enabled,
  });

  const items = (query.data?.data ?? []).map((movement) => ({
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

  const hasNextPage = Boolean(query.data?.has_more);
  const hasPrevPage = cursorStack.length > 0;

  function goNext() {
    const nextCursor = query.data?.next_cursor;
    if (hasNextPage && nextCursor != null) {
      setCursorStack((prev) => [...prev, cursor]);
      setCursor(nextCursor);
    }
  }

  function goPrev() {
    const prevCursor = cursorStack[cursorStack.length - 1];
    setCursor(prevCursor);
    setCursorStack((prev) => prev.slice(0, -1));
  }

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
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        onNextPage={goNext}
        onPrevPage={goPrev}
        pageNumber={pageNumber}
        total={query.data?.total ?? 0}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        search={searchInput}
        onSearchChange={setSearchInput}
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
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<(number | undefined)[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);

  const filtersKey = JSON.stringify({ filters, search: debouncedSearch });
  const [lastFiltersKey, setLastFiltersKey] = useState(filtersKey);
  const [lastPageSize, setLastPageSize] = useState(pageSize);
  if (filtersKey !== lastFiltersKey || pageSize !== lastPageSize) {
    setLastFiltersKey(filtersKey);
    setLastPageSize(pageSize);
    setCursor(undefined);
    setCursorStack([]);
  }

  const pageNumber = cursorStack.length + 1;
  const branchOptions = useBranchOptionsForUser(user, enabled);
  const warehousesQuery = useWarehousesQuery(enabled);
  const contactsQuery = useContactsQuery(enabled);

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

  const query = useQuery({
    queryKey: ["users", userIdNumber, "activity", "sale-orders", filters, pageSize, debouncedSearch, cursor],
    queryFn: () =>
      listSaleOrdersCursor(
        { cursor, limit: pageSize, sort_order: "DESC", search: debouncedSearch || undefined },
        {
          created_by_user_id: userIdNumber,
          branch_id: toNumberFilter(filters.branch_id),
          customer_contact_id: toNumberFilter(filters.customer_contact_id),
          warehouse_id: toNumberFilter(filters.warehouse_id),
          from: filters.from,
          to: filters.to,
          status: filters.status,
        },
      ),
    enabled,
  });

  const items = (query.data?.data ?? []).map((order) => ({
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

  const hasNextPage = Boolean(query.data?.has_more);
  const hasPrevPage = cursorStack.length > 0;

  function goNext() {
    const nextCursor = query.data?.next_cursor;
    if (hasNextPage && nextCursor != null) {
      setCursorStack((prev) => [...prev, cursor]);
      setCursor(nextCursor);
    }
  }

  function goPrev() {
    const prevCursor = cursorStack[cursorStack.length - 1];
    setCursor(prevCursor);
    setCursorStack((prev) => prev.slice(0, -1));
  }

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
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        onNextPage={goNext}
        onPrevPage={goPrev}
        pageNumber={pageNumber}
        total={query.data?.total ?? 0}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        search={searchInput}
        onSearchChange={setSearchInput}
        onItemSelect={(id) => {
          const found = query.data?.data.find((order) => String(order.id) === id);
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
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<(number | undefined)[]>([]);
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchOrder | null>(null);

  const filtersKey = JSON.stringify({ filters, search: debouncedSearch });
  const [lastFiltersKey, setLastFiltersKey] = useState(filtersKey);
  const [lastPageSize, setLastPageSize] = useState(pageSize);
  if (filtersKey !== lastFiltersKey || pageSize !== lastPageSize) {
    setLastFiltersKey(filtersKey);
    setLastPageSize(pageSize);
    setCursor(undefined);
    setCursorStack([]);
  }

  const pageNumber = cursorStack.length + 1;
  const branchOptions = useBranchOptionsForUser(user, enabled);
  const vehiclesQuery = useVehiclesQuery(enabled);
  const routesQuery = useRoutesQuery(enabled);

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

  const query = useQuery({
    queryKey: ["users", userIdNumber, "activity", "dispatch-orders", filters, pageSize, debouncedSearch, cursor],
    queryFn: () =>
      listDispatchOrdersCursor(
        { cursor, limit: pageSize, sort_order: "DESC", search: debouncedSearch || undefined },
        {
          created_by_user_id: userIdNumber,
          branch_id: toNumberFilter(filters.branch_id),
          vehicle_id: toNumberFilter(filters.vehicle_id),
          driver_user_id: toNumberFilter(filters.driver_user_id),
          route_id: toNumberFilter(filters.route_id),
          from: filters.from,
          to: filters.to,
          status: filters.status,
          dispatch_type: filters.dispatch_type,
        },
      ),
    enabled,
  });

  const items = (query.data?.data ?? []).map((order) => ({
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

  const hasNextPage = Boolean(query.data?.has_more);
  const hasPrevPage = cursorStack.length > 0;

  function goNext() {
    const nextCursor = query.data?.next_cursor;
    if (hasNextPage && nextCursor != null) {
      setCursorStack((prev) => [...prev, cursor]);
      setCursor(nextCursor);
    }
  }

  function goPrev() {
    const prevCursor = cursorStack[cursorStack.length - 1];
    setCursor(prevCursor);
    setCursorStack((prev) => prev.slice(0, -1));
  }

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
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        onNextPage={goNext}
        onPrevPage={goPrev}
        pageNumber={pageNumber}
        total={query.data?.total ?? 0}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        search={searchInput}
        onSearchChange={setSearchInput}
        onItemSelect={(id) => {
          const found = query.data?.data.find((order) => String(order.id) === id);
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

function formatTotal(total: number, loaded: number, hasMore: boolean): string {
  // When the backend returns a positive total, trust it as the authoritative
  // filtered count. Otherwise (older backend that doesn't yet emit `total`),
  // fall back to showing how many we've actually loaded so the operator still
  // gets a useful number instead of a misleading "0".
  if (total > 0) return String(total);
  if (loaded === 0) return "0";
  return hasMore ? `${loaded}+` : String(loaded);
}

function PageSizeSelect({
  value,
  onChange,
}: {
  value: PageSize;
  onChange: (size: PageSize) => void;
}) {
  const { t } = useAppTranslator();
  return (
    <div className="flex items-center gap-2">
      <Label className="text-[11px] text-muted-foreground">
        {t("users.activity.filters.page_size_label")}
      </Label>
      <Select onValueChange={(v) => onChange(Number(v) as PageSize)} value={String(value)}>
        <SelectTrigger className="h-8 w-[5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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

type ActivityListProps = {
  icon: LucideIcon;
  loadingLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  items: ActivityItem[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  pageNumber: number;
  total: number;
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onItemSelect?: (id: string) => void;
};

function ActivityList({
  icon: Icon,
  loadingLabel,
  emptyTitle,
  emptyDescription,
  items,
  isLoading,
  isFetching,
  isError,
  error,
  onRetry,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
  pageNumber,
  total,
  pageSize,
  onPageSizeChange,
  search,
  onSearchChange,
  onItemSelect,
}: ActivityListProps) {
  const { t } = useAppTranslator();
  const topRef = useRef<HTMLDivElement>(null);

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

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[12rem]">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label={t("users.activity.search_placeholder")}
          className="h-8 pl-8 pr-7"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("users.activity.search_placeholder")}
          value={search}
        />
        {search ? (
          <button
            type="button"
            aria-label={t("common.clear")}
            onClick={() => onSearchChange("")}
            className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <PageSizeSelect value={pageSize} onChange={onPageSizeChange} />
      <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {isFetching ? (
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        ) : null}
        {t("users.activity.total_records", {
          count: formatTotal(total, items.length, hasNextPage),
        })}
      </span>
    </div>
  );

  if (!items.length && !isFetching) {
    return (
      <div className="space-y-2">
        {toolbar}
        <EmptyState
          icon={ClipboardList}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={topRef} />
      {toolbar}
      <ul className="space-y-1.5">
        {items.map((item) => {
          const interactive = Boolean(onItemSelect);
          const content = (
            <>
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 space-y-0.5 text-left">
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
            </>
          );
          return (
            <li key={item.id}>
              {interactive ? (
                <button
                  type="button"
                  onClick={() => onItemSelect?.(item.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2 text-left transition-colors hover:border-border hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  {content}
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between pt-1">
        <Button
          disabled={!hasPrevPage || isFetching}
          onClick={() => {
            onPrevPage();
            topRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          size="sm"
          variant="ghost"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          {t("users.activity.prev_page")}
        </Button>
        <span className="text-[11px] text-muted-foreground">
          {t("users.activity.page_number", { page: String(pageNumber) })}
        </span>
        <Button
          disabled={!hasNextPage || isFetching}
          onClick={() => {
            onNextPage();
            topRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          size="sm"
          variant="ghost"
        >
          {t("users.activity.next_page")}
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
