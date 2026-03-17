"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";

import {
  cancelInventoryMovement,
  createBrand,
  createInventoryAdjustment,
  createInventoryLot,
  createInventoryTransfer,
  createMeasurementUnit,
  createPriceList,
  createProduct,
  createProductCategory,
  createProductPrice,
  createPromotion,
  createTaxProfile,
  createWarehouse,
  createWarehouseLocation,
  createWarrantyProfile,
  getPriceList,
  getProduct,
  getWarehouse,
  listBrands,
  listInventoryLots,
  listInventoryLotsPaginated,
  listInventoryMovements,
  listInventoryMovementsCursor,
  listMeasurementUnits,
  listPriceLists,
  listProductCategories,
  listProductCategoryTree,
  listProductPrices,
  listProducts,
  listProductsPaginated,
  listPromotions,
  listTaxProfiles,
  listWarehouses,
  listWarehouseLocations,
  listWarehouseStock,
  listWarehouseStockByWarehouse,
  listWarrantyProfiles,
  updateBrand,
  updateInventoryLot,
  updateMeasurementUnit,
  updatePriceList,
  updateProduct,
  updateProductCategory,
  updateProductPrice,
  updatePromotion,
  updateTaxProfile,
  updateWarehouse,
  updateWarehouseLocation,
  updateWarrantyProfile,
} from "./api";
import type { PaginatedQueryParams } from "./api";
import type {
  CancelInventoryMovementInput,
  CreateBrandInput,
  CreateInventoryAdjustmentInput,
  CreateInventoryLotInput,
  CreateInventoryTransferInput,
  CreateMeasurementUnitInput,
  CreatePriceListInput,
  CreateProductCategoryInput,
  CreateProductInput,
  CreateProductPriceInput,
  CreatePromotionInput,
  CreateTaxProfileInput,
  CreateWarehouseInput,
  CreateWarehouseLocationInput,
  CreateWarrantyProfileInput,
  UpdateBrandInput,
  UpdateInventoryLotInput,
  UpdateMeasurementUnitInput,
  UpdatePriceListInput,
  UpdateProductCategoryInput,
  UpdateProductInput,
  UpdateProductPriceInput,
  UpdatePromotionInput,
  UpdateTaxProfileInput,
  UpdateWarehouseInput,
  UpdateWarehouseLocationInput,
  UpdateWarrantyProfileInput,
} from "./types";

export const inventoryKeys = {
  all: ["inventory"] as const,
  brands: () => [...inventoryKeys.all, "brands"] as const,
  inventoryLots: () => [...inventoryKeys.all, "inventory-lots"] as const,
  inventoryMovements: () => [...inventoryKeys.all, "inventory-movements"] as const,
  measurementUnits: () => [...inventoryKeys.all, "measurement-units"] as const,
  priceLists: () => [...inventoryKeys.all, "price-lists"] as const,
  priceList: (priceListId: string) => [...inventoryKeys.priceLists(), priceListId] as const,
  productCategories: () => [...inventoryKeys.all, "product-categories"] as const,
  productCategoryTree: () => [...inventoryKeys.all, "product-categories", "tree"] as const,
  product: (productId: string) => [...inventoryKeys.products(), productId] as const,
  productPrices: (productId: string) => [...inventoryKeys.all, "product-prices", productId] as const,
  products: () => [...inventoryKeys.all, "products"] as const,
  promotions: () => [...inventoryKeys.all, "promotions"] as const,
  taxProfiles: () => [...inventoryKeys.all, "tax-profiles"] as const,
  warehouses: () => [...inventoryKeys.all, "warehouses"] as const,
  warehouseLocations: (warehouseId: string) =>
    [...inventoryKeys.all, "warehouse-locations", warehouseId] as const,
  warehouse: (warehouseId: string) => [...inventoryKeys.warehouses(), warehouseId] as const,
  warehouseStock: () => [...inventoryKeys.all, "warehouse-stock"] as const,
  warehouseStockByWarehouse: (warehouseId: string) =>
    [...inventoryKeys.all, "warehouse-stock", warehouseId] as const,
  warrantyProfiles: () => [...inventoryKeys.all, "warranty-profiles"] as const,
};

type MutationFeedbackOptions = {
  showErrorToast?: boolean;
};

function invalidateInventoryQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKeys: readonly (readonly unknown[])[],
) {
  queryKeys.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
}

export function useBrandsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.brands(),
    queryFn: listBrands,
  });
}

export function useCreateBrandMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateBrandInput) => createBrand(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.brands()]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.brand_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateBrandMutation(
  brandId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateBrandInput | UpdateBrandInput) => updateBrand(brandId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.brands()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.brand_update_error_fallback"),
        });
      }
    },
  });
}

export function useMeasurementUnitsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.measurementUnits(),
    queryFn: listMeasurementUnits,
  });
}

export function useCreateMeasurementUnitMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateMeasurementUnitInput) => createMeasurementUnit(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.measurementUnits()]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.measurement_unit_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateMeasurementUnitMutation(
  measurementUnitId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateMeasurementUnitInput | UpdateMeasurementUnitInput) =>
      updateMeasurementUnit(measurementUnitId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.measurementUnits()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.measurement_unit_update_error_fallback"),
        });
      }
    },
  });
}

export function useProductCategoriesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.productCategories(),
    queryFn: listProductCategories,
  });
}

export function useProductCategoryTreeQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.productCategoryTree(),
    queryFn: listProductCategoryTree,
  });
}

export function useCreateProductCategoryMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateProductCategoryInput) => createProductCategory(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.productCategories(),
        inventoryKeys.productCategoryTree(),
      ]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.category_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateProductCategoryMutation(
  categoryId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateProductCategoryInput | UpdateProductCategoryInput) =>
      updateProductCategory(categoryId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.productCategories(),
        inventoryKeys.productCategoryTree(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.category_update_error_fallback"),
        });
      }
    },
  });
}

export function useTaxProfilesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.taxProfiles(),
    queryFn: listTaxProfiles,
  });
}

export function useProductsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.products(),
    queryFn: listProducts,
  });
}

export function useProductsPaginatedQuery(
  params: PaginatedQueryParams,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryKey: [...inventoryKeys.products(), "paginated", params] as const,
    queryFn: () => listProductsPaginated(params),
    placeholderData: (prev) => prev,
  });
}

export function useProductQuery(productId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(productId),
    queryKey: inventoryKeys.product(productId),
    queryFn: () => getProduct(productId),
  });
}

export function useCreateProductMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateProductInput) => createProduct(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.products()]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.product_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateProductMutation(
  productId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateProductInput | UpdateProductInput) =>
      updateProduct(productId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.products(),
        inventoryKeys.product(productId),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.product_update_error_fallback"),
        });
      }
    },
  });
}

export function usePriceListsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.priceLists(),
    queryFn: listPriceLists,
  });
}

export function usePriceListQuery(priceListId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(priceListId),
    queryKey: inventoryKeys.priceList(priceListId),
    queryFn: () => getPriceList(priceListId),
  });
}

export function useCreatePriceListMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreatePriceListInput) => createPriceList(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.priceLists()]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.price_list_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdatePriceListMutation(
  priceListId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreatePriceListInput | UpdatePriceListInput) =>
      updatePriceList(priceListId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.priceLists(),
        inventoryKeys.priceList(priceListId),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.price_list_update_error_fallback"),
        });
      }
    },
  });
}

export function useProductPricesQuery(productId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(productId),
    queryKey: inventoryKeys.productPrices(productId),
    queryFn: () => listProductPrices(productId),
  });
}

export function useCreateProductPriceMutation(
  productId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateProductPriceInput) => createProductPrice(productId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.productPrices(productId)]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.product_price_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateProductPriceMutation(
  productPriceId: string,
  productId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateProductPriceInput | UpdateProductPriceInput) =>
      updateProductPrice(productPriceId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.productPrices(productId)]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.product_price_update_error_fallback"),
        });
      }
    },
  });
}

export function usePromotionsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.promotions(),
    queryFn: listPromotions,
  });
}

export function useCreatePromotionMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreatePromotionInput) => createPromotion(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.promotions()]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.promotion_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdatePromotionMutation(
  promotionId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreatePromotionInput | UpdatePromotionInput) =>
      updatePromotion(promotionId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.promotions()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.promotion_update_error_fallback"),
        });
      }
    },
  });
}

export function useCreateTaxProfileMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateTaxProfileInput) => createTaxProfile(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.taxProfiles()]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.tax_profile_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateTaxProfileMutation(
  taxProfileId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateTaxProfileInput | UpdateTaxProfileInput) =>
      updateTaxProfile(taxProfileId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.taxProfiles()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.tax_profile_update_error_fallback"),
        });
      }
    },
  });
}

export function useWarrantyProfilesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.warrantyProfiles(),
    queryFn: listWarrantyProfiles,
  });
}

export function useCreateWarrantyProfileMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateWarrantyProfileInput) => createWarrantyProfile(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.warrantyProfiles()]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.warranty_profile_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateWarrantyProfileMutation(
  warrantyProfileId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateWarrantyProfileInput | UpdateWarrantyProfileInput) =>
      updateWarrantyProfile(warrantyProfileId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.warrantyProfiles()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.warranty_profile_update_error_fallback"),
        });
      }
    },
  });
}

export function useWarehousesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.warehouses(),
    queryFn: listWarehouses,
  });
}

export function useWarehouseQuery(warehouseId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(warehouseId),
    queryKey: inventoryKeys.warehouse(warehouseId),
    queryFn: () => getWarehouse(warehouseId),
  });
}

export function useCreateWarehouseMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateWarehouseInput) => createWarehouse(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.warehouses()]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.warehouse_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateWarehouseMutation(
  warehouseId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateWarehouseInput | UpdateWarehouseInput) =>
      updateWarehouse(warehouseId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.warehouses(),
        inventoryKeys.warehouse(warehouseId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
        inventoryKeys.inventoryMovements(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.warehouse_update_error_fallback"),
        });
      }
    },
  });
}

export function useWarehouseLocationsQuery(warehouseId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(warehouseId),
    queryKey: inventoryKeys.warehouseLocations(warehouseId),
    queryFn: () => listWarehouseLocations(warehouseId),
  });
}

export function useCreateWarehouseLocationMutation(
  warehouseId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateWarehouseLocationInput) =>
      createWarehouseLocation(warehouseId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.warehouseLocations(warehouseId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
        inventoryKeys.inventoryMovements(),
      ]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.warehouse_location_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateWarehouseLocationMutation(
  warehouseLocationId: string,
  warehouseId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateWarehouseLocationInput | UpdateWarehouseLocationInput) =>
      updateWarehouseLocation(warehouseLocationId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.warehouseLocations(warehouseId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
        inventoryKeys.inventoryMovements(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.warehouse_location_update_error_fallback"),
        });
      }
    },
  });
}

export function useWarehouseStockQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.warehouseStock(),
    queryFn: listWarehouseStock,
  });
}

export function useWarehouseStockByWarehouseQuery(warehouseId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(warehouseId),
    queryKey: inventoryKeys.warehouseStockByWarehouse(warehouseId),
    queryFn: () => listWarehouseStockByWarehouse(warehouseId),
  });
}

export function useInventoryLotsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.inventoryLots(),
    queryFn: listInventoryLots,
  });
}

export function useInventoryLotsPaginatedQuery(
  params: PaginatedQueryParams,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryKey: [...inventoryKeys.inventoryLots(), "paginated", params] as const,
    queryFn: () => listInventoryLotsPaginated(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateInventoryLotMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateInventoryLotInput) => createInventoryLot(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.inventoryLots(),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryMovements(),
      ]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.inventory_lot_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateInventoryLotMutation(
  inventoryLotId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateInventoryLotInput | UpdateInventoryLotInput) =>
      updateInventoryLot(inventoryLotId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.inventoryLots(),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryMovements(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.inventory_lot_update_error_fallback"),
        });
      }
    },
  });
}

export function useInventoryMovementsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: inventoryKeys.inventoryMovements(),
    queryFn: listInventoryMovements,
  });
}

export function useInventoryMovementsCursorQuery(
  params: PaginatedQueryParams & { cursor?: number },
  enabled = true,
) {
  return useQuery({
    enabled,
    queryKey: [...inventoryKeys.inventoryMovements(), "cursor", params] as const,
    queryFn: () => listInventoryMovementsCursor(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateInventoryAdjustmentMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateInventoryAdjustmentInput) => createInventoryAdjustment(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.inventoryMovements(),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
      ]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.inventory_adjustment_create_error_fallback"),
        });
      }
    },
  });
}

export function useCreateInventoryTransferMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateInventoryTransferInput) => createInventoryTransfer(payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.inventoryMovements(),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
      ]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.inventory_transfer_create_error_fallback"),
        });
      }
    },
  });
}

export function useCancelInventoryMovementMutation(
  movementHeaderId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CancelInventoryMovementInput) =>
      cancelInventoryMovement(movementHeaderId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.inventoryMovements(),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
      ]);
      toast.success(t("common.operation_completed"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.inventory_movement_cancel_error_fallback"),
        });
      }
    },
  });
}
