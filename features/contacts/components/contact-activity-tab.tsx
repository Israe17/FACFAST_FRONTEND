"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Receipt,
  ShieldOff,
  Truck,
  UserSquare2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  listDispatchOrdersCursor,
  listInventoryMovementsCursor,
} from "@/features/inventory/api";
import { InventoryMovementDetailSheet } from "@/features/inventory/components/inventory-movement-detail-sheet";
import { DispatchOrderDetailDialog } from "@/features/inventory/components/dispatch-order-detail-dialog";
import {
  useProductsQuery,
  useRoutesQuery,
  useVehiclesQuery,
  useWarehousesQuery,
} from "@/features/inventory/queries";
import type { DispatchOrder } from "@/features/inventory/types";
import { listSaleOrdersCursor } from "@/features/sales/api";
import { SaleOrderDetailDialog } from "@/features/sales/components/sale-order-detail-dialog";
import type { SaleOrder } from "@/features/sales/types";
import {
  ActivityFiltersBar,
  type FilterField,
  type SelectOption,
} from "@/shared/components/activity-filters-bar";
import {
  ActivityList,
  DEFAULT_PAGE_SIZE,
  type PageSize,
} from "@/shared/components/activity-list";
import { EmptyState } from "@/shared/components/empty-state";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import type { FrontendTranslationKey } from "@/shared/i18n/translations";

import type { Contact } from "../types";

type ContactActivityTabProps = {
  contact: Contact;
  enabled: boolean;
};

type SalesFilters = {
  from?: string;
  to?: string;
  status?: string;
  warehouse_id?: string;
};

type DispatchFilters = {
  from?: string;
  to?: string;
  status?: string;
  dispatch_type?: string;
  vehicle_id?: string;
  route_id?: string;
};

type PurchasesFilters = {
  from?: string;
  to?: string;
  status?: string;
  movement_type?: string;
  warehouse_id?: string;
  product_id?: string;
};

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

function toNumberFilter(value: string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function isFiltersDirty(
  filters: Record<string, string | undefined>,
): boolean {
  return Object.values(filters).some(
    (value) => value !== undefined && value !== "",
  );
}

function buildEnumOptions(
  values: readonly string[],
  translate: (value: string) => string,
): SelectOption[] {
  return values.map((value) => ({ value, label: translate(value) }));
}

export function ContactActivityTab({
  contact,
  enabled,
}: ContactActivityTabProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();

  const viewerCanViewSales = can("sale_orders.view");
  const viewerCanViewDispatch = can("dispatch_orders.view");
  const viewerCanViewMovements = can("inventory_movements.view");

  const isCustomer = contact.type === "customer" || contact.type === "both";
  const isSupplier = contact.type === "supplier" || contact.type === "both";

  const showSales = viewerCanViewSales && isCustomer;
  const showDispatch = viewerCanViewDispatch && isCustomer;
  const showPurchases = viewerCanViewMovements && isSupplier;

  const contactIdNumber = Number(contact.id);
  const validContactId =
    Number.isFinite(contactIdNumber) && contactIdNumber > 0;

  const initialSubTab = showSales
    ? "sales"
    : showDispatch
      ? "dispatch"
      : showPurchases
        ? "purchases"
        : "sales";

  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab);
  const [salesFilters, setSalesFilters] = useState<SalesFilters>({});
  const [dispatchFilters, setDispatchFilters] = useState<DispatchFilters>({});
  const [purchasesFilters, setPurchasesFilters] = useState<PurchasesFilters>(
    {},
  );

  if (!viewerCanViewSales && !viewerCanViewDispatch && !viewerCanViewMovements) {
    return (
      <EmptyState
        icon={ShieldOff}
        title={t("contacts.activity.permission_required_title")}
        description={t("contacts.activity.permission_required_description")}
      />
    );
  }

  if (!isCustomer && !isSupplier) {
    return (
      <EmptyState
        icon={UserSquare2}
        title={t("contacts.activity.no_type_title")}
        description={t("contacts.activity.no_type_description", {
          name: contact.name,
        })}
      />
    );
  }

  if (!showSales && !showDispatch && !showPurchases) {
    return (
      <EmptyState
        icon={ShieldOff}
        title={t("contacts.activity.permission_required_title")}
        description={t("contacts.activity.permission_required_description")}
      />
    );
  }

  return (
    <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
      <TabsList>
        {showSales ? (
          <TabsTrigger value="sales">
            {t("contacts.activity.sales_title")}
          </TabsTrigger>
        ) : null}
        {showDispatch ? (
          <TabsTrigger value="dispatch">
            {t("contacts.activity.dispatch_title")}
          </TabsTrigger>
        ) : null}
        {showPurchases ? (
          <TabsTrigger value="purchases">
            {t("contacts.activity.purchases_title")}
          </TabsTrigger>
        ) : null}
      </TabsList>

      {showSales ? (
        <TabsContent value="sales" className="space-y-3">
          <SalesList
            contactId={contactIdNumber}
            filters={salesFilters}
            setFilters={setSalesFilters}
            enabled={
              enabled && validContactId && activeSubTab === "sales"
            }
          />
        </TabsContent>
      ) : null}

      {showDispatch ? (
        <TabsContent value="dispatch" className="space-y-3">
          <DispatchList
            contactId={contactIdNumber}
            filters={dispatchFilters}
            setFilters={setDispatchFilters}
            enabled={
              enabled && validContactId && activeSubTab === "dispatch"
            }
          />
        </TabsContent>
      ) : null}

      {showPurchases ? (
        <TabsContent value="purchases" className="space-y-3">
          <PurchasesList
            contactId={contactIdNumber}
            filters={purchasesFilters}
            setFilters={setPurchasesFilters}
            enabled={
              enabled && validContactId && activeSubTab === "purchases"
            }
          />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}

type SalesListProps = {
  contactId: number;
  filters: SalesFilters;
  setFilters: (next: SalesFilters) => void;
  enabled: boolean;
};

function SalesList({ contactId, filters, setFilters, enabled }: SalesListProps) {
  const { t } = useAppTranslator();
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
  const warehousesQuery = useWarehousesQuery(enabled);

  const statusOptions = buildEnumOptions(SALE_ORDER_STATUS_VALUES, (value) =>
    t(`users.activity.status.${value}` as FrontendTranslationKey),
  );
  const warehouseOptions: SelectOption[] = (warehousesQuery.data ?? []).map(
    (warehouse) => ({ value: String(warehouse.id), label: warehouse.name }),
  );

  const fields: FilterField[] = [
    {
      key: "status",
      label: t("users.activity.filters.status_label"),
      options: statusOptions,
      value: filters.status,
      onChange: (value) => setFilters({ ...filters, status: value }),
    },
    {
      key: "warehouse",
      label: t("users.activity.filters.warehouse_label"),
      options: warehouseOptions,
      value: filters.warehouse_id,
      onChange: (value) => setFilters({ ...filters, warehouse_id: value }),
    },
  ];

  const query = useQuery({
    queryKey: [
      "contacts",
      contactId,
      "activity",
      "sale-orders",
      filters,
      pageSize,
      debouncedSearch,
      cursor,
    ],
    queryFn: () =>
      listSaleOrdersCursor(
        {
          cursor,
          limit: pageSize,
          sort_order: "DESC",
          search: debouncedSearch || undefined,
        },
        {
          customer_contact_id: contactId,
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
      order.seller?.name ?? null,
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
        loadingLabel={t("contacts.activity.loading_sales")}
        emptyTitle={t("contacts.activity.sales_empty_title")}
        emptyDescription={t("contacts.activity.sales_empty_description")}
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
          const found = query.data?.data.find(
            (order) => String(order.id) === id,
          );
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
  contactId: number;
  filters: DispatchFilters;
  setFilters: (next: DispatchFilters) => void;
  enabled: boolean;
};

function DispatchList({
  contactId,
  filters,
  setFilters,
  enabled,
}: DispatchListProps) {
  const { t } = useAppTranslator();
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<(number | undefined)[]>([]);
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchOrder | null>(
    null,
  );

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

  const query = useQuery({
    queryKey: [
      "contacts",
      contactId,
      "activity",
      "dispatch-orders",
      filters,
      pageSize,
      debouncedSearch,
      cursor,
    ],
    queryFn: () =>
      listDispatchOrdersCursor(
        {
          cursor,
          limit: pageSize,
          sort_order: "DESC",
          search: debouncedSearch || undefined,
        },
        {
          customer_contact_id: contactId,
          vehicle_id: toNumberFilter(filters.vehicle_id),
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
        loadingLabel={t("contacts.activity.loading_dispatch")}
        emptyTitle={t("contacts.activity.dispatch_empty_title")}
        emptyDescription={t("contacts.activity.dispatch_empty_description")}
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
          const found = query.data?.data.find(
            (order) => String(order.id) === id,
          );
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

type PurchasesListProps = {
  contactId: number;
  filters: PurchasesFilters;
  setFilters: (next: PurchasesFilters) => void;
  enabled: boolean;
};

function PurchasesList({
  contactId,
  filters,
  setFilters,
  enabled,
}: PurchasesListProps) {
  const { t } = useAppTranslator();
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<(number | undefined)[]>([]);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(
    null,
  );

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

  const query = useQuery({
    queryKey: [
      "contacts",
      contactId,
      "activity",
      "inventory-movements",
      filters,
      pageSize,
      debouncedSearch,
      cursor,
    ],
    queryFn: () =>
      listInventoryMovementsCursor(
        {
          cursor,
          limit: pageSize,
          sort_order: "DESC",
          search: debouncedSearch || undefined,
        },
        {
          supplier_contact_id: contactId,
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
        loadingLabel={t("contacts.activity.loading_purchases")}
        emptyTitle={t("contacts.activity.purchases_empty_title")}
        emptyDescription={t("contacts.activity.purchases_empty_description")}
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
