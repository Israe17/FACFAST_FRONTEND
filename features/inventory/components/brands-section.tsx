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

import { useBrandsQuery, useDeleteBrandMutation } from "../queries";
import type { Brand } from "../types";
import { BrandDialog } from "./brand-dialog";
import { getBrandsColumns } from "./brands-columns";
import { CatalogSectionCard } from "./catalog-section-card";

type BrandsSectionProps = {
  enabled?: boolean;
};

function BrandsSection({ enabled = true }: BrandsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("brands.view");
  const canCreate = can("brands.create");
  const canUpdate = can("brands.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const brandsQuery = useBrandsQuery(enabled && canView);
  const deleteMutation = useDeleteBrandMutation({ showErrorToast: true });

  const handleEdit = useCallback((brand: Brand) => {
    setSelectedBrand(brand);
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const columns = useMemo(
    () => getBrandsColumns({ canUpdate, onDelete: setDeleteTarget, onEdit: handleEdit, t }),
    [canUpdate, handleEdit, t],
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
                setSelectedBrand(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", { entity: t("inventory.entity.brand") })}
            </Button>
          ) : null
        }
        description={t("inventory.brands.section_description")}
        title={t("inventory.entity.brands")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            brandsQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.brands"),
            }),
          )}
          isError={brandsQuery.isError}
          isLoading={brandsQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.brands"),
          })}
          onRetry={() => brandsQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={brandsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.brands"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <BrandDialog
        brand={selectedBrand}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedBrand(null);
          }
        }}
        open={dialogOpen}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.brands.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.brands.delete_description", { name: deleteTarget?.name ?? "" })}
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

export { BrandsSection };
