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
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import {
  useDispatchOrdersQuery,
  useMarkDispatchReadyMutation,
  useMarkDispatchDispatchedMutation,
  useMarkDispatchCompletedMutation,
  useCancelDispatchOrderMutation,
} from "../queries";
import type { DispatchOrder } from "../types";
import { DispatchOrderDialog } from "./dispatch-order-dialog";
import { DispatchOrderDetailDialog } from "./dispatch-order-detail-dialog";
import { getDispatchOrdersColumns } from "./dispatch-orders-columns";
import { CatalogSectionCard } from "./catalog-section-card";

type DispatchOrdersSectionProps = {
  enabled?: boolean;
};

function DispatchOrdersSection({ enabled = true }: DispatchOrdersSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("dispatch_orders.view");
  const canCreate = can("dispatch_orders.create");
  const canUpdate = can("dispatch_orders.update");
  const canCancel = can("dispatch_orders.cancel");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<DispatchOrder | null>(null);
  const [readyTarget, setReadyTarget] = useState<DispatchOrder | null>(null);
  const [dispatchTarget, setDispatchTarget] = useState<DispatchOrder | null>(null);
  const [completeTarget, setCompleteTarget] = useState<DispatchOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<DispatchOrder | null>(null);

  const ordersQuery = useDispatchOrdersQuery(enabled && canView);
  const readyMutation = useMarkDispatchReadyMutation(readyTarget?.id?.toString() ?? "", {
    showErrorToast: true,
  });
  const dispatchMutation = useMarkDispatchDispatchedMutation(dispatchTarget?.id?.toString() ?? "", {
    showErrorToast: true,
  });
  const completeMutation = useMarkDispatchCompletedMutation(completeTarget?.id?.toString() ?? "", {
    showErrorToast: true,
  });
  const cancelMutation = useCancelDispatchOrderMutation(cancelTarget?.id?.toString() ?? "", {
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

  const columns = useMemo(
    () =>
      getDispatchOrdersColumns({
        canUpdate,
        canCancel,
        onEdit: handleEdit,
        onReady: setReadyTarget,
        onDispatch: setDispatchTarget,
        onComplete: setCompleteTarget,
        onCancel: setCancelTarget,
        onViewDetail: handleViewDetail,
        t,
      }),
    [canUpdate, canCancel, handleEdit, handleViewDetail, t],
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
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.dispatch_order"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.dispatch.section_description")}
        title={t("inventory.entity.dispatch_orders")}
      >
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
          <DataTable
            columns={columns}
            data={ordersQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.dispatch_orders"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <DispatchOrderDialog
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
          if (!open) setDetailOrder(null);
        }}
      />

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
    </>
  );
}

export { DispatchOrdersSection };
