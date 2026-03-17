"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import { useWarrantyProfilesQuery } from "../queries";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarrantyProfile, setSelectedWarrantyProfile] =
    useState<WarrantyProfile | null>(null);
  const warrantyProfilesQuery = useWarrantyProfilesQuery(enabled && canView);

  const handleEdit = useCallback((warrantyProfile: WarrantyProfile) => {
    setSelectedWarrantyProfile(warrantyProfile);
    setDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => getWarrantyProfilesColumns({ canUpdate, onEdit: handleEdit, t }),
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
    </>
  );
}

export { WarrantyProfilesSection };
