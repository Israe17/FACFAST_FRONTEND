"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useServerTableState } from "@/shared/hooks/use-server-table-state";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { useSidebar } from "@/components/ui/sidebar";

import { LayoutList, Map, Monitor } from "lucide-react";

import { useBranchesQuery } from "@/features/branches/queries";
import { useUsersQuery } from "@/features/users/queries";
import { useSaleOrdersQuery } from "@/features/sales/queries";

import {
  useDispatchOrdersQuery,
  useDispatchOrdersPaginatedQuery,
  useMarkDispatchReadyMutation,
  useMarkDispatchDispatchedMutation,
  useMarkDispatchCompletedMutation,
  useCancelDispatchOrderMutation,
  useDeleteDispatchOrderMutation,
  useRoutesQuery,
  useVehiclesQuery,
  useWarehousesQuery,
  useZonesQuery,
} from "../queries";
import type { DispatchOrder } from "../types";
import { AddDispatchStopDialog } from "./add-dispatch-stop-dialog";
import { DispatchOrderDialog } from "./dispatch-order-dialog";
import { DispatchOrderDetailDialog } from "./dispatch-order-detail-dialog";
import { DispatchCommandCenter } from "./dispatch-command-center";
import { DispatchMapView } from "./dispatch-map-view";
import { getDispatchOrdersColumns } from "./dispatch-orders-columns";
import { CatalogSectionCard } from "./catalog-section-card";

type DispatchOrdersSectionProps = {
  enabled?: boolean;
};

function DispatchOrdersSection({ enabled = true }: DispatchOrdersSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const sidebar = useSidebar();
  const sidebarWasOpen = useRef(sidebar.open);
  const sidebarRef = useRef(sidebar);
  sidebarRef.current = sidebar;
  const canView = can("dispatch_orders.view");
  const canCreate = can("dispatch_orders.create");
  const canUpdate = can("dispatch_orders.update");
  const canCancel = can("dispatch_orders.cancel");
  const canDelete = can("dispatch_orders.delete");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<DispatchOrder | null>(null);
  const [readyTarget, setReadyTarget] = useState<DispatchOrder | null>(null);
  const [dispatchTarget, setDispatchTarget] = useState<DispatchOrder | null>(null);
  const [completeTarget, setCompleteTarget] = useState<DispatchOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<DispatchOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DispatchOrder | null>(null);
  const [addStopTarget, setAddStopTarget] = useState<DispatchOrder | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "map" | "command">("table");
  const { serverState, onStateChange, queryParams } = useServerTableState({ sort_by: "scheduled_date", sort_order: "DESC" });

  // Restore sidebar when unmounting (user navigates away while in operational view)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable, only run on unmount
  useEffect(() => {
    return () => {
      if (sidebarWasOpen.current) {
        sidebarRef.current.setOpen(true);
      }
    };
  }, []);

  const handleViewModeChange = useCallback(
    (mode: "table" | "map" | "command") => {
      if (mode === "command" || mode === "map") {
        if (viewMode === "table") {
          sidebarWasOpen.current = sidebarRef.current.open;
        }
        sidebarRef.current.setOpen(false);
      } else {
        sidebarRef.current.setOpen(sidebarWasOpen.current);
      }
      setViewMode(mode);
    },
    [viewMode],
  );

  // Prefetch catalogs at section level so they are in cache when dialog opens
  const branchesQuery = useBranchesQuery(enabled && canView);
  const usersQuery = useUsersQuery(enabled && canView);
  const warehousesQuery = useWarehousesQuery(enabled && canView);
  const routesQuery = useRoutesQuery(enabled && canView);
  const vehiclesQuery = useVehiclesQuery(enabled && canView);
  const saleOrdersQuery = useSaleOrdersQuery(enabled && canView);

  const pendingSaleOrders = useMemo(
    () =>
      (saleOrdersQuery.data ?? []).filter(
        (o) =>
          o.status === "confirmed" &&
          o.fulfillment_mode === "delivery" &&
          o.dispatch_status === "pending",
      ),
    [saleOrdersQuery.data],
  );

  const ordersPaginatedQuery = useDispatchOrdersPaginatedQuery(queryParams, enabled && canView);
  const ordersQuery = useDispatchOrdersQuery(enabled && canView && viewMode !== "table");
  const zonesQuery = useZonesQuery(enabled && canView);
  const readyMutation = useMarkDispatchReadyMutation(readyTarget?.id ?? "", {
    showErrorToast: true,
  });
  const dispatchMutation = useMarkDispatchDispatchedMutation(dispatchTarget?.id ?? "", {
    showErrorToast: true,
  });
  const completeMutation = useMarkDispatchCompletedMutation(completeTarget?.id ?? "", {
    showErrorToast: true,
  });
  const cancelMutation = useCancelDispatchOrderMutation(cancelTarget?.id ?? "", {
    showErrorToast: true,
  });
  const deleteMutation = useDeleteDispatchOrderMutation(deleteTarget?.id ?? "", {
    showErrorToast: true,
  });

  const handleEdit = useCallback((order: DispatchOrder) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  }, []);

  const handleViewDetail = useCallback((order: DispatchOrder) => {
    setDetailOrder(order);
    setDetailDialogOpen(true);
  }, []);

  const handleReadyConfirm = useCallback(async () => {
    if (!readyTarget) return;
    await readyMutation.mutateAsync();
    setReadyTarget(null);
  }, [readyTarget, readyMutation]);

  const handleDispatchConfirm = useCallback(async () => {
    if (!dispatchTarget) return;
    await dispatchMutation.mutateAsync();
    setDispatchTarget(null);
  }, [dispatchTarget, dispatchMutation]);

  const handleCompleteConfirm = useCallback(async () => {
    if (!completeTarget) return;
    await completeMutation.mutateAsync();
    setCompleteTarget(null);
  }, [completeTarget, completeMutation]);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget) return;
    await cancelMutation.mutateAsync();
    setCancelTarget(null);
  }, [cancelTarget, cancelMutation]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync();
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const columns = useMemo(
    () =>
      getDispatchOrdersColumns({
        canUpdate,
        canCancel,
        canDelete,
        onEdit: handleEdit,
        onReady: setReadyTarget,
        onDispatch: setDispatchTarget,
        onComplete: setCompleteTarget,
        onCancel: setCancelTarget,
        onDelete: setDeleteTarget,
        onViewDetail: handleViewDetail,
        t,
      }),
    [canUpdate, canCancel, canDelete, handleEdit, handleViewDetail, t],
  );

  if (!canView) {
    return null;
  }

  return (
    <>
      <CatalogSectionCard
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border p-0.5">
              <Button
                size="sm"
                variant={viewMode === "table" ? "secondary" : "ghost"}
                className="h-7 px-2"
                onClick={() => handleViewModeChange("table")}
              >
                <LayoutList className="size-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "map" ? "secondary" : "ghost"}
                className="h-7 px-2"
                onClick={() => handleViewModeChange("map")}
              >
                <Map className="size-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "command" ? "secondary" : "ghost"}
                className="h-7 px-2"
                onClick={() => handleViewModeChange("command")}
                title={t("inventory.dispatch.command_center")}
              >
                <Monitor className="size-4" />
              </Button>
            </div>
            {canCreate ? (
              <Button
                onClick={() => {
                  setSelectedOrder(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">
                  {t("inventory.common.create_entity", {
                    entity: t("inventory.entity.dispatch_order"),
                  })}
                </span>
              </Button>
            ) : null}
          </div>
        }
        description={t("inventory.dispatch.section_description")}
        title={t("inventory.entity.dispatch_orders")}
      >
        {viewMode === "table" ? (
          <DataTable
            columns={columns}
            data={ordersPaginatedQuery.data?.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.dispatch_orders"),
            })}
            serverSide
            serverState={serverState}
            onServerStateChange={onStateChange}
            total={ordersPaginatedQuery.data?.total ?? 0}
          />
        ) : (
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            ordersQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.dispatch_orders"),
            }),
          )}
          isError={ordersQuery.isError}
          isLoading={ordersQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.dispatch_orders"),
          })}
          onRetry={() => ordersQuery.refetch()}
        >
          {viewMode === "map" ? (
            <DispatchMapView
              orders={ordersQuery.data ?? []}
              warehouses={warehousesQuery.data ?? []}
              zones={zonesQuery.data ?? []}
              onViewOrderDetail={handleViewDetail}
              onEditOrder={handleEdit}
              onDispatchOrder={setDispatchTarget}
              onCancelOrder={setCancelTarget}
              onAddStop={setAddStopTarget}
            />
          ) : (
            <DispatchCommandCenter
              pendingOrders={pendingSaleOrders}
              dispatchOrders={ordersQuery.data ?? []}
              warehouses={warehousesQuery.data ?? []}
              zones={zonesQuery.data ?? []}
              onCreateDispatch={() => {
                setSelectedOrder(null);
                setDialogOpen(true);
              }}
              onViewDispatchDetail={handleViewDetail}
              onEditDispatch={handleEdit}
              onDispatchDispatch={setDispatchTarget}
              onCancelDispatch={setCancelTarget}
              onAddStop={setAddStopTarget}
            />
          )}
        </QueryStateWrapper>
        )}
      </CatalogSectionCard>

      <DispatchOrderDialog
        branches={branchesQuery.data ?? []}
        users={usersQuery.data ?? []}
        warehouses={warehousesQuery.data ?? []}
        routes={routesQuery.data ?? []}
        vehicles={vehiclesQuery.data ?? []}
        saleOrders={saleOrdersQuery.data ?? []}
        order={selectedOrder}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedOrder(null);
          }
        }}
        open={dialogOpen}
      />

      <DispatchOrderDetailDialog
        order={detailOrder}
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) {
            setDetailOrder(null);
          }
        }}
      />

      {addStopTarget ? (
        <AddDispatchStopDialog
          dispatchOrder={addStopTarget}
          pendingOrders={pendingSaleOrders}
          open
          onOpenChange={(open) => {
            if (!open) setAddStopTarget(null);
          }}
        />
      ) : null}

      {/* Ready confirmation dialog */}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setReadyTarget(null);
        }}
        open={readyTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("inventory.dispatch.mark_ready")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.dispatch.mark_ready_confirm")}: {readyTarget?.code ?? ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleReadyConfirm}>
              {t("inventory.dispatch.mark_ready")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dispatch confirmation dialog */}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDispatchTarget(null);
        }}
        open={dispatchTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("inventory.dispatch.mark_dispatched")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.dispatch.mark_dispatched")}: {dispatchTarget?.code ?? ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDispatchConfirm}>
              {t("inventory.dispatch.mark_dispatched")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete confirmation dialog */}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setCompleteTarget(null);
        }}
        open={completeTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("inventory.dispatch.mark_completed")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.dispatch.mark_completed")}: {completeTarget?.code ?? ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteConfirm}>
              {t("inventory.dispatch.mark_completed")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel confirmation dialog */}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        open={cancelTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("inventory.dispatch.cancel")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.dispatch.cancel")}: {cancelTarget?.code ?? ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm}>
              {t("inventory.dispatch.cancel")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("inventory.common.delete")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.dispatch.delete_confirm")}: {deleteTarget?.code ?? ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              {t("inventory.common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { DispatchOrdersSection };
