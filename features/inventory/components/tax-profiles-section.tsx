"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import { useTaxProfilesQuery } from "../queries";
import type { TaxProfile } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { TaxProfileDialog } from "./tax-profile-dialog";
import { getTaxProfilesColumns } from "./tax-profiles-columns";

type TaxProfilesSectionProps = {
  enabled?: boolean;
};

function TaxProfilesSection({ enabled = true }: TaxProfilesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("tax_profiles.view");
  const canCreate = can("tax_profiles.create");
  const canUpdate = can("tax_profiles.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTaxProfile, setSelectedTaxProfile] = useState<TaxProfile | null>(null);
  const taxProfilesQuery = useTaxProfilesQuery(enabled && canView);

  const onEdit = useCallback((taxProfile: TaxProfile) => {
    setSelectedTaxProfile(taxProfile);
    setDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => getTaxProfilesColumns({ canUpdate, onEdit, t }),
    [canUpdate, onEdit, t],
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
                setSelectedTaxProfile(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.tax_profile"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.tax_profiles.section_description")}
        title={t("inventory.entity.tax_profiles")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            taxProfilesQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.tax_profiles"),
            }),
          )}
          isError={taxProfilesQuery.isError}
          isLoading={taxProfilesQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.tax_profiles"),
          })}
          onRetry={() => taxProfilesQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={taxProfilesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.tax_profiles"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <TaxProfileDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedTaxProfile(null);
          }
        }}
        open={dialogOpen}
        taxProfile={selectedTaxProfile}
      />
    </>
  );
}

export { TaxProfilesSection };
