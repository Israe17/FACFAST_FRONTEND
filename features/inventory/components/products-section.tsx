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

import {
  useDeactivateProductMutation,
  useReactivateProductMutation,
  useBrandsQuery,
  useMeasurementUnitsQuery,
  useProductCategoriesQuery,
  useProductsPaginatedQuery,
  useTaxProfilesQuery,
  useWarrantyProfilesQuery,
} from "../queries";
import type { Product } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { ProductDialog } from "./product-dialog";
import { getProductsColumns } from "./products-columns";

type ProductsSectionProps = {
  enabled?: boolean;
};

function ProductsSection({ enabled = true }: ProductsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("products.view");
  const canCreate = can("products.create");
  const canUpdate = can("products.update");
  const canDelete = can("products.delete");
  const canViewCategories = can("categories.view");
  const canViewBrands = can("brands.view");
  const canViewMeasurementUnits = can("measurement_units.view");
  const canViewTaxProfiles = can("tax_profiles.view");
  const canViewWarrantyProfiles = can("warranty_profiles.view");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Product | null>(null);
  const { serverState, onStateChange, queryParams } = useServerTableState({ sort_by: "name" });
  const productsQuery = useProductsPaginatedQuery(queryParams, enabled && canView);
  const categoriesQuery = useProductCategoriesQuery(enabled && canViewCategories);
  const brandsQuery = useBrandsQuery(enabled && canViewBrands);
  const measurementUnitsQuery = useMeasurementUnitsQuery(enabled && canViewMeasurementUnits);
  const taxProfilesQuery = useTaxProfilesQuery(enabled && canViewTaxProfiles);
  const warrantyProfilesQuery = useWarrantyProfilesQuery(enabled && canViewWarrantyProfiles);
  const deactivateMutation = useDeactivateProductMutation({ showErrorToast: true });
  const reactivateMutation = useReactivateProductMutation({ showErrorToast: true });

  const onEdit = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  }, []);

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateTarget) return;
    await deactivateMutation.mutateAsync(deactivateTarget.id);
    setDeactivateTarget(null);
  }, [deactivateTarget, deactivateMutation]);

  const columns = useMemo(
    () =>
      getProductsColumns({
        canDelete,
        canUpdate,
        canView,
        onDeactivate: setDeactivateTarget,
        onEdit,
        onReactivate: (product) => {
          void reactivateMutation.mutateAsync(product.id);
        },
        t,
      }),
    [canDelete, canUpdate, canView, onEdit, reactivateMutation, t],
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
                setSelectedProduct(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.product"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.products.section_description")}
        title={t("inventory.entity.products")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            productsQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.products"),
            }),
          )}
          isError={productsQuery.isError}
          isLoading={productsQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.products"),
          })}
          onRetry={() => productsQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={productsQuery.data?.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.products"),
            })}
            onServerStateChange={onStateChange}
            serverSide
            serverState={serverState}
            total={productsQuery.data?.total ?? 0}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <ProductDialog
        brands={brandsQuery.data ?? []}
        categories={categoriesQuery.data ?? []}
        measurementUnits={measurementUnitsQuery.data ?? []}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedProduct(null);
          }
        }}
        open={dialogOpen}
        product={selectedProduct}
        taxProfiles={taxProfilesQuery.data ?? []}
        warrantyProfiles={warrantyProfilesQuery.data ?? []}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null);
        }}
        open={deactivateTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.products.deactivate_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.products.deactivate_description", {
                name: deactivateTarget?.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateConfirm}>
              {t("inventory.common.deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { ProductsSection };
