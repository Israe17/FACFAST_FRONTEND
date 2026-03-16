"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import {
  useBrandsQuery,
  useMeasurementUnitsQuery,
  useProductCategoriesQuery,
  useProductsQuery,
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const productsQuery = useProductsQuery(enabled && canView);
  const categoriesQuery = useProductCategoriesQuery(enabled && canView);
  const brandsQuery = useBrandsQuery(enabled && canView);
  const measurementUnitsQuery = useMeasurementUnitsQuery(enabled && canView);
  const taxProfilesQuery = useTaxProfilesQuery(enabled && canView);
  const warrantyProfilesQuery = useWarrantyProfilesQuery(enabled && canView);

  const onEdit = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => getProductsColumns({ canUpdate, canView, onEdit, t }),
    [canUpdate, canView, onEdit, t],
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
            data={productsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.products"),
            })}
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
    </>
  );
}

export { ProductsSection };
