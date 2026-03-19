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

import { useDeletePriceListMutation, usePriceListsQuery } from "../queries";
import type { PriceList } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { PriceListDialog } from "./price-list-dialog";
import { getPriceListsColumns } from "./price-lists-columns";

type PriceListsSectionProps = {
  enabled?: boolean;
};

function PriceListsSection({ enabled = true }: PriceListsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("price_lists.view");
  const canCreate = can("price_lists.create");
  const canUpdate = can("price_lists.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PriceList | null>(null);
  const priceListsQuery = usePriceListsQuery(enabled && canView);
  const deleteMutation = useDeletePriceListMutation({ showErrorToast: true });

  const handleEdit = useCallback((priceList: PriceList) => {
    setSelectedPriceList(priceList);
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const columns = useMemo(
    () =>
      getPriceListsColumns({
        canUpdate,
        canView,
        onDelete: setDeleteTarget,
        onEdit: handleEdit,
        t,
      }),
    [canUpdate, canView, handleEdit, t],
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
                setSelectedPriceList(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.price_list"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.price_lists.section_description")}
        title={t("inventory.entity.price_lists")}
      >
        <QueryStateWrapper
          isLoading={priceListsQuery.isLoading}
          isError={priceListsQuery.isError}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.price_lists"),
          })}
          errorDescription={getBackendErrorMessage(
            priceListsQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.price_lists"),
            }),
          )}
          onRetry={() => priceListsQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={priceListsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.price_lists"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <PriceListDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedPriceList(null);
          }
        }}
        open={dialogOpen}
        priceList={selectedPriceList}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.price_lists.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.price_lists.delete_description", { name: deleteTarget?.name ?? "" })}
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

export { PriceListsSection };
