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

import { useDeleteProductCategoryMutation, useProductCategoriesQuery } from "../queries";
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
  const canDelete = can("categories.delete");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);
  const categoriesQuery = useProductCategoriesQuery(enabled && canView);
  const deleteMutation = useDeleteProductCategoryMutation({ showErrorToast: true });

  const childrenCountById = useMemo(() => {
    const counts = new Map<string, number>();
    for (const category of categoriesQuery.data ?? []) {
      if (category.parent_id) {
        counts.set(category.parent_id, (counts.get(category.parent_id) ?? 0) + 1);
      }
    }
    return counts;
  }, [categoriesQuery.data]);

  const sortedCategories = useMemo(() => {
    const all = categoriesQuery.data ?? [];
    const childrenByParent = new Map<string | null, ProductCategory[]>();
    for (const category of all) {
      const key = category.parent_id ?? null;
      const existing = childrenByParent.get(key) ?? [];
      existing.push(category);
      childrenByParent.set(key, existing);
    }
    for (const list of childrenByParent.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    const result: ProductCategory[] = [];
    const visit = (parentId: string | null) => {
      for (const category of childrenByParent.get(parentId) ?? []) {
        result.push(category);
        visit(category.id);
      }
    };
    visit(null);
    return result;
  }, [categoriesQuery.data]);

  const handleEdit = useCallback((category: ProductCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const columns = useMemo(
    () =>
      getProductCategoriesColumns({
        canDelete,
        canUpdate,
        childrenCountById,
        onDelete: setDeleteTarget,
        onEdit: handleEdit,
        t,
      }),
    [canDelete, canUpdate, childrenCountById, handleEdit, t],
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
            data={sortedCategories}
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

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.categories.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.categories.delete_description", { name: deleteTarget?.name ?? "" })}
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

export { ProductCategoriesSection };
