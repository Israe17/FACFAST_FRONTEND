"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import { useProductsQuery, usePromotionsQuery } from "../queries";
import type { Promotion } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { PromotionDialog } from "./promotion-dialog";
import { getPromotionsColumns } from "./promotions-columns";

type PromotionsSectionProps = {
  enabled?: boolean;
};

function PromotionsSection({ enabled = true }: PromotionsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("promotions.view");
  const canCreate = can("promotions.create");
  const canUpdate = can("promotions.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const promotionsQuery = usePromotionsQuery(enabled && canView);
  const productsQuery = useProductsQuery(enabled && canView);

  const handleEdit = useCallback((promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => getPromotionsColumns({ canUpdate, onEdit: handleEdit, t }),
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
                setSelectedPromotion(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.promotion"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.promotions.section_description")}
        title={t("inventory.entity.promotions")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            promotionsQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.promotions"),
            }),
          )}
          isError={promotionsQuery.isError}
          isLoading={promotionsQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.promotions"),
          })}
          onRetry={() => promotionsQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={promotionsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.promotions"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <PromotionDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedPromotion(null);
          }
        }}
        open={dialogOpen}
        products={productsQuery.data ?? []}
        promotion={selectedPromotion}
      />
    </>
  );
}

export { PromotionsSection };
