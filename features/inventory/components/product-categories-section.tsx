"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import { useProductCategoriesQuery } from "../queries";
import type { ProductCategory } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { getProductCategoriesColumns } from "./product-categories-columns";
import { ProductCategoryDialog } from "./product-category-dialog";

type ProductCategoriesSectionProps = {
  enabled?: boolean;
};

function ProductCategoriesSection({ enabled = true }: ProductCategoriesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("categories.view");
  const canCreate = can("categories.create");
  const canUpdate = can("categories.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const categoriesQuery = useProductCategoriesQuery(enabled && canView);

  const parentNameById = useMemo(() => {
    return new Map((categoriesQuery.data ?? []).map((category) => [category.id, category.name]));
  }, [categoriesQuery.data]);

  const handleEdit = useCallback((category: ProductCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => getProductCategoriesColumns({ canUpdate, onEdit: handleEdit, parentNameById, t }),
    [canUpdate, handleEdit, parentNameById, t],
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
                setSelectedCategory(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.product_category"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.categories.section_description")}
        title={t("inventory.entity.product_categories")}
      >
        <QueryStateWrapper
          isLoading={categoriesQuery.isLoading}
          isError={categoriesQuery.isError}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.product_categories"),
          })}
          errorDescription={getBackendErrorMessage(
            categoriesQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.product_categories"),
            }),
          )}
          onRetry={() => categoriesQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={categoriesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.product_categories"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <ProductCategoryDialog
        categories={categoriesQuery.data ?? []}
        category={selectedCategory}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedCategory(null);
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}

export { ProductCategoriesSection };
