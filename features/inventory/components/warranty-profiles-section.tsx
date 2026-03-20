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

import { useDeleteWarrantyProfileMutation, useWarrantyProfilesQuery } from "../queries";
import type { WarrantyProfile } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { WarrantyProfileDialog } from "./warranty-profile-dialog";
import { getWarrantyProfilesColumns } from "./warranty-profiles-columns";

type WarrantyProfilesSectionProps = {
  enabled?: boolean;
};

function WarrantyProfilesSection({ enabled = true }: WarrantyProfilesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("warranty_profiles.view");
  const canCreate = can("warranty_profiles.create");
  const canUpdate = can("warranty_profiles.update");
  const canDelete = can("warranty_profiles.delete");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarrantyProfile, setSelectedWarrantyProfile] =
    useState<WarrantyProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WarrantyProfile | null>(null);
  const warrantyProfilesQuery = useWarrantyProfilesQuery(enabled && canView);
  const deleteMutation = useDeleteWarrantyProfileMutation({ showErrorToast: true });

  const handleEdit = useCallback((warrantyProfile: WarrantyProfile) => {
    setSelectedWarrantyProfile(warrantyProfile);
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const columns = useMemo(
    () =>
      getWarrantyProfilesColumns({
        canDelete,
        canUpdate,
        onDelete: setDeleteTarget,
        onEdit: handleEdit,
        t,
      }),
    [canDelete, canUpdate, handleEdit, t],
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
                setSelectedWarrantyProfile(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.warranty_profile"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.warranty_profiles.section_description")}
        title={t("inventory.entity.warranty_profiles")}
      >
        <QueryStateWrapper
          isLoading={warrantyProfilesQuery.isLoading}
          isError={warrantyProfilesQuery.isError}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.warranty_profiles"),
          })}
          errorDescription={getBackendErrorMessage(
            warrantyProfilesQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.warranty_profiles"),
            }),
          )}
          onRetry={() => warrantyProfilesQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={warrantyProfilesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.warranty_profiles"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <WarrantyProfileDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedWarrantyProfile(null);
          }
        }}
        open={dialogOpen}
        warrantyProfile={selectedWarrantyProfile}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.warranty_profiles.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.warranty_profiles.delete_description", {
                name: deleteTarget?.name ?? "",
              })}
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

export { WarrantyProfilesSection };
