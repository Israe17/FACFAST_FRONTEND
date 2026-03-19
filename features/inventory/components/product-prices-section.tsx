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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/shared/components/data-table";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import {
  useDeleteProductPriceMutation,
  usePriceListsQuery,
  useProductPricesQuery,
  useProductsQuery,
} from "../queries";
import type { ProductPrice } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { ProductPriceDialog } from "./product-price-dialog";
import { getProductPricesColumns } from "./product-prices-columns";

const EMPTY_SELECT_VALUE = "__none__";

type ProductPricesSectionProps = {
  enabled?: boolean;
};

function ProductPricesSection({ enabled = true }: ProductPricesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("product_prices.view");
  const canCreate = can("product_prices.create");
  const canUpdate = can("product_prices.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductPrice, setSelectedProductPrice] = useState<ProductPrice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductPrice | null>(null);
  const productsQuery = useProductsQuery(enabled && canView);
  const priceListsQuery = usePriceListsQuery(enabled && canView);
  const resolvedSelectedProductId =
    selectedProductId && productsQuery.data?.some((product) => product.id === selectedProductId)
      ? selectedProductId
      : (productsQuery.data?.[0]?.id ?? "");
  const productPricesQuery = useProductPricesQuery(resolvedSelectedProductId, enabled && canView);
  const selectedProduct =
    productsQuery.data?.find((product) => product.id === resolvedSelectedProductId) ?? null;
  const deleteMutation = useDeleteProductPriceMutation(resolvedSelectedProductId, {
    showErrorToast: true,
  });

  const onEdit = useCallback((productPrice: ProductPrice) => {
    setSelectedProductPrice(productPrice);
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const columns = useMemo(
    () => getProductPricesColumns({ canUpdate, onDelete: setDeleteTarget, onEdit, t }),
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
              disabled={!selectedProduct}
              onClick={() => {
                setSelectedProductPrice(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.product_price"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.product_prices.section_description")}
        title={t("inventory.entity.product_prices")}
      >
        <div className="max-w-md space-y-2">
          <Label htmlFor="product-prices-product">{t("inventory.form.product")}</Label>
          <Select
            onValueChange={setSelectedProductId}
            value={resolvedSelectedProductId || EMPTY_SELECT_VALUE}
          >
            <SelectTrigger id="product-prices-product">
              <SelectValue placeholder={t("inventory.form.select_product")} />
            </SelectTrigger>
            <SelectContent>
              {(productsQuery.data ?? []).length ? null : (
                <SelectItem value={EMPTY_SELECT_VALUE}>
                  {t("inventory.product_prices.no_products_available")}
                </SelectItem>
              )}
              {(productsQuery.data ?? []).map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {productsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.products"),
            })}
          />
        ) : null}
        {productsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              productsQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.products"),
              }),
            )}
            onRetry={() => productsQuery.refetch()}
          />
        ) : null}
        {!productsQuery.isLoading && !productsQuery.isError && !selectedProduct ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            {t("inventory.product_prices.no_product_selected")}
          </div>
        ) : null}
        {selectedProduct && productPricesQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.product_prices"),
            })}
          />
        ) : null}
        {selectedProduct && productPricesQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              productPricesQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.product_prices"),
              }),
            )}
            onRetry={() => productPricesQuery.refetch()}
          />
        ) : null}
        {selectedProduct && !productPricesQuery.isLoading && !productPricesQuery.isError ? (
          <DataTable
            columns={columns}
            data={productPricesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.product_prices"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <ProductPriceDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedProductPrice(null);
          }
        }}
        open={dialogOpen}
        priceLists={priceListsQuery.data ?? []}
        product={selectedProduct}
        productPrice={selectedProductPrice}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.product_prices.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.product_prices.delete_description")}
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

export { ProductPricesSection };
