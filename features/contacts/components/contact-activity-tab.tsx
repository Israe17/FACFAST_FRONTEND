"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Receipt,
  ShieldOff,
  Truck,
  UserSquare2,
} from "lucide-react";

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
import { ActivityList } from "@/shared/components/activity-list";
import { EmptyState } from "@/shared/components/empty-state";
import { useActivityCursorList } from "@/shared/hooks/use-activity-cursor-list";
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
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const warehousesQuery = useWarehousesQuery(enabled);

  const list = useActivityCursorList({
    baseQueryKey: ["contacts", contactId, "activity", "sale-orders"],
    filters,
    enabled,
    queryFn: ({ cursor, limit, search, filters: f }) =>
      listSaleOrdersCursor(
        { cursor, limit, sort_order: "DESC", search },
        {
          customer_contact_id: contactId,
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

  const items = list.rawItems.map((order) => ({
    id: String(order.id),
    primary: order.code ?? `#${order.id}`,
    secondary: [order.seller?.name ?? null, order.branch?.name ?? null]
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
        loadingLabel={t("contacts.activity.loading_sales")}
        emptyTitle={t("contacts.activity.sales_empty_title")}
        emptyDescription={t("contacts.activity.sales_empty_description")}
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
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchOrder | null>(
    null,
  );
  const vehiclesQuery = useVehiclesQuery(enabled);
  const routesQuery = useRoutesQuery(enabled);

  const list = useActivityCursorList({
    baseQueryKey: ["contacts", contactId, "activity", "dispatch-orders"],
    filters,
    enabled,
    queryFn: ({ cursor, limit, search, filters: f }) =>
      listDispatchOrdersCursor(
        { cursor, limit, sort_order: "DESC", search },
        {
          customer_contact_id: contactId,
          vehicle_id: toNumberFilter(f.vehicle_id),
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
        loadingLabel={t("contacts.activity.loading_dispatch")}
        emptyTitle={t("contacts.activity.dispatch_empty_title")}
        emptyDescription={t("contacts.activity.dispatch_empty_description")}
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
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(
    null,
  );
  const warehousesQuery = useWarehousesQuery(enabled);
  const productsQuery = useProductsQuery(enabled);

  const list = useActivityCursorList({
    baseQueryKey: ["contacts", contactId, "activity", "inventory-movements"],
    filters,
    enabled,
    queryFn: ({ cursor, limit, search, filters: f }) =>
      listInventoryMovementsCursor(
        { cursor, limit, sort_order: "DESC", search },
        {
          supplier_contact_id: contactId,
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
        loadingLabel={t("contacts.activity.loading_purchases")}
        emptyTitle={t("contacts.activity.purchases_empty_title")}
        emptyDescription={t("contacts.activity.purchases_empty_description")}
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
