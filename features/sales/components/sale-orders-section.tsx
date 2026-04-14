"use client";

import { useCallback, useMemo, useState } from "react";
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

import { useBranchesQuery } from "@/features/branches/queries";
import { useContactsQuery } from "@/features/contacts/queries";
import { useUsersQuery } from "@/features/users/queries";
import {
  useProductsQuery,
  useWarehousesQuery,
  useZonesQuery,
} from "@/features/inventory/queries";

import {
  useSaleOrdersPaginatedQuery,
  useConfirmSaleOrderMutation,
  useCancelSaleOrderMutation,
  useDeleteSaleOrderMutation,
} from "../queries";
import type { SaleOrder } from "../types";
import { SaleOrderDetailDialog } from "./sale-order-detail-dialog";
import { SaleOrderDialog } from "./sale-order-dialog";
import { getSaleOrdersColumns } from "./sale-orders-columns";
import { CatalogSectionCard } from "@/features/inventory/components/catalog-section-card";

type SaleOrdersSectionProps = {
  enabled?: boolean;
};

function SaleOrdersSection({ enabled = true }: SaleOrdersSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("sale_orders.view");
  const canCreate = can("sale_orders.create");
  const canUpdate = can("sale_orders.update");
  const canConfirm = can("sale_orders.confirm");
  const canCancel = can("sale_orders.cancel");
  const canDelete = can("sale_orders.delete");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<SaleOrder | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<SaleOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SaleOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SaleOrder | null>(null);
  // Prefetch catalogs at section level so they are in cache when dialog opens
  const branchesQuery = useBranchesQuery(enabled && canView);
  const contactsQuery = useContactsQuery(enabled && canView);
  const usersQuery = useUsersQuery(enabled && canView);
  const warehousesQuery = useWarehousesQuery(enabled && canView);
  const productsQuery = useProductsQuery(enabled && canView);
  const zonesQuery = useZonesQuery(enabled && canView);

  const { serverState, onStateChange, queryParams } = useServerTableState({ sort_by: "order_date", sort_order: "DESC" });
  const ordersQuery = useSaleOrdersPaginatedQuery(queryParams, enabled && canView);
  const confirmMutation = useConfirmSaleOrderMutation(confirmTarget?.id ?? "", {
    showErrorToast: true,
  });
  const cancelMutation = useCancelSaleOrderMutation(cancelTarget?.id ?? "", {
    showErrorToast: true,
  });
  const deleteMutation = useDeleteSaleOrderMutation(deleteTarget?.id ?? "", {
    showErrorToast: true,
  });

  const handleEdit = useCallback((order: SaleOrder) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  }, []);

  const handleViewDetail = useCallback((order: SaleOrder) => {
    setDetailOrder(order);
    setDetailDialogOpen(true);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmTarget) return;
    await confirmMutation.mutateAsync();
    setConfirmTarget(null);
  }, [confirmTarget, confirmMutation]);

  const handleCancelAction = useCallback(async () => {
    if (!cancelTarget) return;
    await cancelMutation.mutateAsync({ reason: "" });
    setCancelTarget(null);
  }, [cancelTarget, cancelMutation]);

  const handleDeleteAction = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync();
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const columns = useMemo(
    () =>
      getSaleOrdersColumns({
        canUpdate,
        canConfirm,
        canCancel,
        canDelete,
        onEdit: handleEdit,
        onConfirm: setConfirmTarget,
        onCancel: setCancelTarget,
        onDelete: setDeleteTarget,
        onViewDetail: handleViewDetail,
        t,
      }),
    [canUpdate, canConfirm, canCancel, canDelete, handleEdit, handleViewDetail, t],
  );

  if (!canView) {
    return null;
  }

  return (
    <>
      <CatalogSectionCard
        action={
          canCreate ? (
            <Button
              onClick={() => {
                setSelectedOrder(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", { entity: t("sales.entity.sale_order") })}
            </Button>
          ) : null
        }
        description={t("sales.section_description")}
        title={t("sales.entity.sale_orders")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            ordersQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("sales.entity.sale_orders"),
            }),
          )}
          isError={ordersQuery.isError}
          isLoading={ordersQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("sales.entity.sale_orders"),
          })}
          onRetry={() => ordersQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={ordersQuery.data?.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("sales.entity.sale_orders"),
            })}
            serverSide
            serverState={serverState}
            onServerStateChange={onStateChange}
            total={ordersQuery.data?.total ?? 0}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <SaleOrderDialog
        branches={branchesQuery.data ?? []}
        contacts={contactsQuery.data ?? []}
        users={usersQuery.data ?? []}
        warehouses={warehousesQuery.data ?? []}
        products={productsQuery.data ?? []}
        zones={zonesQuery.data ?? []}
        order={selectedOrder}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedOrder(null);
          }
        }}
        open={dialogOpen}
      />

      <SaleOrderDetailDialog
        order={detailOrder}
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) setDetailOrder(null);
        }}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        open={confirmTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sales.confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sales.confirm_description", { code: confirmTarget?.code ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {t("sales.confirm_order")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        open={cancelTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sales.cancel_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sales.cancel_description", { code: cancelTarget?.code ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelAction}>
              {t("sales.cancel_order")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sales.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sales.delete_description", { code: deleteTarget?.code ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAction}>
              {t("inventory.common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { SaleOrdersSection };
