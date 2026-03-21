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
  createPriceListBranchAssignment,
  createProduct,
  createProductCategory,
  createProductPrice,
  createProductSerials,
  createProductVariant,
  deactivateProductVariant,
  deactivateProduct,
  deactivateWarehouse,
  deactivateInventoryLot,
  deleteProductVariantPermanent,
  deleteBrand,
  deleteProductCategory,
  deleteMeasurementUnit,
  deleteWarrantyProfile,
  deletePriceList,
  deletePriceListBranchAssignment,
  deleteProductPrice,
  deletePromotion,
  deletePromotionBranchAssignment,
  createPromotion,
  createPromotionBranchAssignment,
  createTaxProfile,
  createWarehouse,
  createWarehouseLocation,
  createWarrantyProfile,
  generateVariantsFromAttributes,
  getInventoryMovement,
  getPriceList,
  getProduct,
  getWarehouse,
  listBranchPriceLists,
  listBranchPromotions,
  listBrands,
  listInventoryLots,
  listInventoryLotsPaginated,
  listInventoryMovements,
  listInventoryMovementsPaginated,
  listMeasurementUnits,
  listPriceLists,
  listPriceListBranchAssignments,
  listProductCategories,
  listProductCategoryTree,
  listProductPrices,
  listProductSerials,
  listProducts,
  listProductsPaginated,
  listProductVariants,
  listPromotions,
  listPromotionBranchAssignments,
  listTaxProfiles,
  listVariantAttributes,
  listWarehouses,
  listWarehouseLocations,
  listWarehouseStock,
  listWarehouseStockByWarehouse,
  listWarrantyProfiles,
  setVariantAttributes,
  updateBrand,
  updateInventoryLot,
  updateMeasurementUnit,
  updatePriceList,
  updatePriceListBranchAssignment,
  updateProduct,
  updateProductCategory,
  updateProductPrice,
  updateProductSerial,
  updateProductVariant,
  updatePromotion,
  updatePromotionBranchAssignment,
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
  CreatePriceListBranchAssignmentInput,
  CreateProductCategoryInput,
  CreateProductInput,
  CreateProductPriceInput,
  CreateProductSerialsInput,
  CreateProductVariantInput,
  CreatePromotionInput,
  CreatePromotionBranchAssignmentInput,
  CreateTaxProfileInput,
  CreateWarehouseInput,
  CreateWarehouseLocationInput,
  CreateWarrantyProfileInput,
  UpdateBrandInput,
  UpdateInventoryLotInput,
  UpdateMeasurementUnitInput,
  UpdatePriceListInput,
  UpdatePriceListBranchAssignmentInput,
  UpdateProductCategoryInput,
  UpdateProductInput,
  UpdateProductPriceInput,
  UpdateProductSerialStatusInput,
  UpdateProductVariantInput,
  UpdatePromotionInput,
  UpdatePromotionBranchAssignmentInput,
  UpdateTaxProfileInput,
  UpdateWarehouseInput,
  UpdateWarehouseLocationInput,
  UpdateWarrantyProfileInput,
} from "./types";

export const inventoryKeys = {
  all: ["inventory"] as const,
  brands: () => [...inventoryKeys.all, "brands"] as const,
  branchPriceListsRoot: () => [...inventoryKeys.all, "branch-price-lists"] as const,
  branchPriceLists: (branchId: string) =>
    [...inventoryKeys.branchPriceListsRoot(), branchId] as const,
  branchPromotionsRoot: () => [...inventoryKeys.all, "branch-promotions"] as const,
  branchPromotions: (branchId: string) =>
    [...inventoryKeys.branchPromotionsRoot(), branchId] as const,
  inventoryLot: (lotId: string) => [...inventoryKeys.inventoryLots(), lotId] as const,
  inventoryLots: () => [...inventoryKeys.all, "inventory-lots"] as const,
  inventoryMovement: (movementId: string) => [...inventoryKeys.inventoryMovements(), movementId] as const,
  inventoryMovements: () => [...inventoryKeys.all, "inventory-movements"] as const,
  measurementUnits: () => [...inventoryKeys.all, "measurement-units"] as const,
  priceLists: () => [...inventoryKeys.all, "price-lists"] as const,
  priceListBranchesRoot: () => [...inventoryKeys.all, "price-list-branches"] as const,
  priceListBranches: (priceListId: string) =>
    [...inventoryKeys.priceListBranchesRoot(), priceListId] as const,
  priceList: (priceListId: string) => [...inventoryKeys.priceLists(), priceListId] as const,
  promotion: (promotionId: string) => [...inventoryKeys.promotions(), promotionId] as const,
  promotionBranchesRoot: () => [...inventoryKeys.all, "promotion-branches"] as const,
  promotionBranches: (promotionId: string) =>
    [...inventoryKeys.promotionBranchesRoot(), promotionId] as const,
  productCategories: () => [...inventoryKeys.all, "product-categories"] as const,
  productCategoryTree: () => [...inventoryKeys.all, "product-categories", "tree"] as const,
  product: (productId: string) => [...inventoryKeys.products(), productId] as const,
  productPrices: (productId: string) => [...inventoryKeys.all, "product-prices", productId] as const,
  productSerials: (productId: string, variantId: string) =>
    [...inventoryKeys.all, "product-serials", productId, variantId] as const,
  products: () => [...inventoryKeys.all, "products"] as const,
  promotions: () => [...inventoryKeys.all, "promotions"] as const,
  taxProfiles: () => [...inventoryKeys.all, "tax-profiles"] as const,
  warehouses: () => [...inventoryKeys.all, "warehouses"] as const,
  warehouseLocations: (warehouseId: string) =>
    [...inventoryKeys.all, "warehouse-locations", warehouseId] as const,
  warehouseLocation: (warehouseLocationId: string) =>
    [...inventoryKeys.all, "warehouse-location", warehouseLocationId] as const,
  warehouse: (warehouseId: string) => [...inventoryKeys.warehouses(), warehouseId] as const,
  warehouseStock: () => [...inventoryKeys.all, "warehouse-stock"] as const,
  warehouseStockByWarehouse: (warehouseId: string) =>
    [...inventoryKeys.all, "warehouse-stock", warehouseId] as const,
  productVariants: (productId: string) =>
    [...inventoryKeys.all, "product-variants", productId] as const,
  variantAttributes: (productId: string) =>
    [...inventoryKeys.all, "variant-attributes", productId] as const,
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
    onSuccess: (product) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.products(),
        inventoryKeys.product(product.id),
        inventoryKeys.productVariants(product.id),
        inventoryKeys.productPrices(product.id),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
      ]);
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
        inventoryKeys.productVariants(productId),
        inventoryKeys.productPrices(productId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
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

export function usePriceListBranchAssignmentsQuery(priceListId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(priceListId),
    queryKey: inventoryKeys.priceListBranches(priceListId),
    queryFn: () => listPriceListBranchAssignments(priceListId),
  });
}

export function useBranchPriceListsQuery(branchId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(branchId),
    queryKey: inventoryKeys.branchPriceLists(branchId),
    queryFn: () => listBranchPriceLists(branchId),
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
        inventoryKeys.priceListBranches(priceListId),
        inventoryKeys.branchPriceListsRoot(),
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

export function useCreatePriceListBranchAssignmentMutation(
  priceListId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreatePriceListBranchAssignmentInput) =>
      createPriceListBranchAssignment(priceListId, payload),
    onSuccess: (assignment) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.priceLists(),
        inventoryKeys.priceList(priceListId),
        inventoryKeys.priceListBranches(priceListId),
        inventoryKeys.branchPriceLists(assignment.branch.id),
      ]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.price_list_branch_assignment_create_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useUpdatePriceListBranchAssignmentMutation(
  priceListId: string,
  assignmentId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: UpdatePriceListBranchAssignmentInput) =>
      updatePriceListBranchAssignment(priceListId, assignmentId, payload),
    onSuccess: (assignment) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.priceLists(),
        inventoryKeys.priceList(priceListId),
        inventoryKeys.priceListBranches(priceListId),
        inventoryKeys.branchPriceLists(assignment.branch.id),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.price_list_branch_assignment_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeletePriceListBranchAssignmentMutation(
  priceListId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: ({
      assignmentId,
    }: {
      assignmentId: string;
      branchId: string;
    }) => deletePriceListBranchAssignment(priceListId, assignmentId),
    onSuccess: (_data, variables) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.priceLists(),
        inventoryKeys.priceList(priceListId),
        inventoryKeys.priceListBranches(priceListId),
        inventoryKeys.branchPriceLists(variables.branchId),
      ]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.price_list_branch_assignment_delete_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function usePromotionBranchAssignmentsQuery(promotionId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(promotionId),
    queryKey: inventoryKeys.promotionBranches(promotionId),
    queryFn: () => listPromotionBranchAssignments(promotionId),
  });
}

export function useBranchPromotionsQuery(branchId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(branchId),
    queryKey: inventoryKeys.branchPromotions(branchId),
    queryFn: () => listBranchPromotions(branchId),
  });
}

export function useCreatePromotionMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreatePromotionInput) => createPromotion(payload),
    onSuccess: (promotion) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.promotions(),
        inventoryKeys.promotion(promotion.id),
      ]);
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
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.promotions(),
        inventoryKeys.promotion(promotionId),
        inventoryKeys.promotionBranches(promotionId),
        inventoryKeys.branchPromotionsRoot(),
      ]);
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
    onSuccess: (warehouse) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.warehouses(),
        inventoryKeys.warehouse(warehouse.id),
        inventoryKeys.warehouseStock(),
        inventoryKeys.warehouseStockByWarehouse(warehouse.id),
      ]);
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
        inventoryKeys.warehouseStockByWarehouse(warehouseId),
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
        inventoryKeys.warehouse(warehouseId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.warehouseStockByWarehouse(warehouseId),
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
        inventoryKeys.warehouseLocation(warehouseLocationId),
        inventoryKeys.warehouse(warehouseId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.warehouseStockByWarehouse(warehouseId),
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
    onSuccess: async (lot) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.inventoryLots(),
        inventoryKeys.inventoryLot(lot.id),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryMovements(),
      ]);
      if ((lot.initial_quantity ?? 0) > 0) {
        await queryClient.refetchQueries({ queryKey: inventoryKeys.inventoryMovements() });
      }
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
        inventoryKeys.inventoryLot(inventoryLotId),
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

export function useCreatePromotionBranchAssignmentMutation(
  promotionId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreatePromotionBranchAssignmentInput) =>
      createPromotionBranchAssignment(promotionId, payload),
    onSuccess: (assignment) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.promotions(),
        inventoryKeys.promotion(promotionId),
        inventoryKeys.promotionBranches(promotionId),
        inventoryKeys.branchPromotions(assignment.branch.id),
      ]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.promotion_branch_assignment_create_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useUpdatePromotionBranchAssignmentMutation(
  promotionId: string,
  assignmentId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: UpdatePromotionBranchAssignmentInput) =>
      updatePromotionBranchAssignment(promotionId, assignmentId, payload),
    onSuccess: (assignment) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.promotions(),
        inventoryKeys.promotion(promotionId),
        inventoryKeys.promotionBranches(promotionId),
        inventoryKeys.branchPromotions(assignment.branch.id),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.promotion_branch_assignment_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeletePromotionBranchAssignmentMutation(
  promotionId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: ({
      assignmentId,
    }: {
      assignmentId: string;
      branchId: string;
    }) => deletePromotionBranchAssignment(promotionId, assignmentId),
    onSuccess: (_data, variables) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.promotions(),
        inventoryKeys.promotion(promotionId),
        inventoryKeys.promotionBranches(promotionId),
        inventoryKeys.branchPromotions(variables.branchId),
      ]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.promotion_branch_assignment_delete_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useInventoryMovementQuery(movementId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(movementId),
    queryKey: inventoryKeys.inventoryMovement(movementId),
    queryFn: () => getInventoryMovement(movementId),
  });
}

export function useInventoryMovementsPaginatedQuery(
  params: PaginatedQueryParams,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryKey: [...inventoryKeys.inventoryMovements(), "paginated", params] as const,
    queryFn: () => listInventoryMovementsPaginated(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateInventoryAdjustmentMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateInventoryAdjustmentInput) => createInventoryAdjustment(payload),
    onSuccess: (movement) => {
      const queryKeys = [
        inventoryKeys.inventoryMovements(),
        inventoryKeys.inventoryMovement(movement.id),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
      ] as const;
      invalidateInventoryQueries(queryClient, queryKeys);
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
    onSuccess: (movement, payload) => {
      const queryKeys: (readonly unknown[])[] = [
        inventoryKeys.inventoryMovements(),
        inventoryKeys.inventoryMovement(movement.id),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
      ];
      if (
        movement.transferred_serial_ids.length > 0 &&
        payload.product_id &&
        payload.product_variant_id
      ) {
        queryKeys.push(inventoryKeys.productSerials(payload.product_id, payload.product_variant_id));
      }
      invalidateInventoryQueries(queryClient, queryKeys);
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
        inventoryKeys.inventoryMovement(movementHeaderId),
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

export function useProductVariantsQuery(productId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(productId),
    queryKey: inventoryKeys.productVariants(productId),
    queryFn: () => listProductVariants(productId),
  });
}

export function useProductSerialsQuery(
  productId: string,
  variantId: string,
  params: { status?: string; warehouse_id?: string } = {},
  enabled = true,
) {
  return useQuery({
    enabled: enabled && Boolean(productId) && Boolean(variantId),
    queryKey: [...inventoryKeys.productSerials(productId, variantId), params] as const,
    queryFn: () => listProductSerials(productId, variantId, params),
  });
}

export function useCreateProductSerialsMutation(
  productId: string,
  variantId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateProductSerialsInput) => createProductSerials(productId, variantId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.productSerials(productId, variantId)]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.product_serial_create_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useUpdateProductSerialStatusMutation(
  productId: string,
  variantId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: ({
      payload,
      serialId,
    }: {
      payload: UpdateProductSerialStatusInput;
      serialId: string;
    }) => updateProductSerial(serialId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.productSerials(productId, variantId)]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.product_serial_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useCreateProductVariantMutation(
  productId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateProductVariantInput) =>
      createProductVariant(productId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.productVariants(productId),
        inventoryKeys.product(productId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
        inventoryKeys.productPrices(productId),
        inventoryKeys.promotions(),
      ]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.variant_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateProductVariantMutation(
  productId: string,
  variantId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateProductVariantInput | UpdateProductVariantInput) =>
      updateProductVariant(productId, variantId, payload),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.productVariants(productId),
        inventoryKeys.product(productId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
        inventoryKeys.productPrices(productId),
        inventoryKeys.promotions(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.variant_update_error_fallback"),
        });
      }
    },
  });
}

export function useVariantAttributesQuery(productId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(productId),
    queryKey: inventoryKeys.variantAttributes(productId),
    queryFn: () => listVariantAttributes(productId),
  });
}

export function useSetVariantAttributesMutation(
  productId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (
      attributes: {
        name: string;
        display_order?: number;
        values: { value: string; display_order?: number }[];
      }[],
    ) => setVariantAttributes(productId, attributes),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.variantAttributes(productId),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.variant_attributes_save_error_fallback"),
        });
      }
    },
  });
}

export function useGenerateVariantsMutation(
  productId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: () => generateVariantsFromAttributes(productId),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.productVariants(productId),
        inventoryKeys.variantAttributes(productId),
        inventoryKeys.product(productId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
        inventoryKeys.productPrices(productId),
        inventoryKeys.promotions(),
      ]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.variant_generate_error_fallback"),
        });
      }
    },
  });
}

export function useDeactivateProductVariantMutation(
  productId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (variantId: string) => deactivateProductVariant(productId, variantId),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.productVariants(productId),
        inventoryKeys.product(productId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
        inventoryKeys.productPrices(productId),
        inventoryKeys.promotions(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.variant_deactivate_error_fallback"),
        });
      }
    },
  });
}

export function useReactivateProductVariantMutation(
  productId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (variantId: string) => updateProductVariant(productId, variantId, { is_active: true }),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.productVariants(productId),
        inventoryKeys.product(productId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
        inventoryKeys.productPrices(productId),
        inventoryKeys.promotions(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.variant_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeleteProductVariantPermanentMutation(
  productId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (variantId: string) => deleteProductVariantPermanent(productId, variantId),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.productVariants(productId),
        inventoryKeys.product(productId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
        inventoryKeys.productPrices(productId),
        inventoryKeys.promotions(),
      ]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.variant_delete_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeleteBrandMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (brandId: string) => deleteBrand(brandId),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.brands()]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.brand_delete_error_fallback"),
        });
      }
    },
  });
}

export function useDeleteProductCategoryMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (categoryId: string) => deleteProductCategory(categoryId),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.productCategories(),
        inventoryKeys.productCategoryTree(),
      ]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.category_delete_error_fallback"),
        });
      }
    },
  });
}

export function useDeleteMeasurementUnitMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (unitId: string) => deleteMeasurementUnit(unitId),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.measurementUnits()]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.measurement_unit_delete_error_fallback"),
        });
      }
    },
  });
}

export function useDeleteWarrantyProfileMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (profileId: string) => deleteWarrantyProfile(profileId),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.warrantyProfiles()]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.warranty_profile_delete_error_fallback"),
        });
      }
    },
  });
}

export function useDeletePriceListMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (priceListId: string) => deletePriceList(priceListId),
    onSuccess: (_data, priceListId) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.priceLists(),
        inventoryKeys.priceList(priceListId),
        inventoryKeys.priceListBranches(priceListId),
        inventoryKeys.branchPriceListsRoot(),
      ]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.price_list_delete_error_fallback"),
        });
      }
    },
  });
}

export function useDeleteProductPriceMutation(
  productId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (priceId: string) => deleteProductPrice(priceId),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.productPrices(productId)]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.product_price_delete_error_fallback"),
        });
      }
    },
  });
}

export function useDeletePromotionMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (promotionId: string) => deletePromotion(promotionId),
    onSuccess: (_data, promotionId) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.promotions(),
        inventoryKeys.promotion(promotionId),
        inventoryKeys.promotionBranches(promotionId),
        inventoryKeys.branchPromotionsRoot(),
      ]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.promotion_delete_error_fallback"),
        });
      }
    },
  });
}

export function useDeactivateProductMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (productId: string) => deactivateProduct(productId),
    onSuccess: (_data, productId) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.products(),
        inventoryKeys.product(productId),
        inventoryKeys.productVariants(productId),
        inventoryKeys.productPrices(productId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.product_deactivate_error_fallback"),
        });
      }
    },
  });
}

export function useReactivateProductMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (productId: string) => updateProduct(productId, { is_active: true }),
    onSuccess: (_data, productId) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.products(),
        inventoryKeys.product(productId),
        inventoryKeys.productVariants(productId),
        inventoryKeys.productPrices(productId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryLots(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.product_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeactivateWarehouseMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (warehouseId: string) => deactivateWarehouse(warehouseId),
    onSuccess: (_data, warehouseId) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.warehouses(),
        inventoryKeys.warehouse(warehouseId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.warehouseStockByWarehouse(warehouseId),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.warehouse_deactivate_error_fallback"),
        });
      }
    },
  });
}

export function useReactivateWarehouseMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (warehouseId: string) => updateWarehouse(warehouseId, { is_active: true }),
    onSuccess: (_data, warehouseId) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.warehouses(),
        inventoryKeys.warehouse(warehouseId),
        inventoryKeys.warehouseStock(),
        inventoryKeys.warehouseStockByWarehouse(warehouseId),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.warehouse_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeactivateInventoryLotMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (lotId: string) => deactivateInventoryLot(lotId),
    onSuccess: (lot) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.inventoryLots(),
        inventoryKeys.inventoryLot(lot.id),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryMovements(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.inventory_lot_deactivate_error_fallback"),
        });
      }
    },
  });
}

export function useReactivateInventoryLotMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (lotId: string) => updateInventoryLot(lotId, { is_active: true }),
    onSuccess: (lot) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.inventoryLots(),
        inventoryKeys.inventoryLot(lot.id),
        inventoryKeys.warehouseStock(),
        inventoryKeys.inventoryMovements(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.inventory_lot_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useSetPriceListActiveMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: ({ isActive, priceListId }: { isActive: boolean; priceListId: string }) =>
      updatePriceList(priceListId, { is_active: isActive }),
    onSuccess: (_data, { priceListId }) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.priceLists(),
        inventoryKeys.priceList(priceListId),
        inventoryKeys.priceListBranches(priceListId),
        inventoryKeys.branchPriceListsRoot(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.price_list_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeactivateBrandMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (brandId: string) => updateBrand(brandId, { is_active: false }),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.brands()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.brand_deactivate_error_fallback"),
        });
      }
    },
  });
}

export function useReactivateBrandMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (brandId: string) => updateBrand(brandId, { is_active: true }),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.brands()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.brand_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeactivateProductCategoryMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (categoryId: string) => updateProductCategory(categoryId, { is_active: false }),
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
          fallbackMessage: t("inventory.category_deactivate_error_fallback"),
        });
      }
    },
  });
}

export function useReactivateProductCategoryMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (categoryId: string) => updateProductCategory(categoryId, { is_active: true }),
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
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeactivateMeasurementUnitMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (measurementUnitId: string) =>
      updateMeasurementUnit(measurementUnitId, { is_active: false }),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.measurementUnits()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.measurement_unit_deactivate_error_fallback"),
        });
      }
    },
  });
}

export function useReactivateMeasurementUnitMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (measurementUnitId: string) =>
      updateMeasurementUnit(measurementUnitId, { is_active: true }),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.measurementUnits()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.measurement_unit_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeactivateTaxProfileMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (taxProfileId: string) => updateTaxProfile(taxProfileId, { is_active: false }),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.taxProfiles()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.tax_profile_deactivate_error_fallback"),
        });
      }
    },
  });
}

export function useReactivateTaxProfileMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (taxProfileId: string) => updateTaxProfile(taxProfileId, { is_active: true }),
    onSuccess: () => {
      invalidateInventoryQueries(queryClient, [inventoryKeys.taxProfiles()]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.tax_profile_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}

export function useDeactivatePriceListMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (priceListId: string) => updatePriceList(priceListId, { is_active: false }),
    onSuccess: (_data, priceListId) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.priceLists(),
        inventoryKeys.priceList(priceListId),
        inventoryKeys.priceListBranches(priceListId),
        inventoryKeys.branchPriceListsRoot(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.price_list_deactivate_error_fallback"),
        });
      }
    },
  });
}

export function useReactivatePriceListMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (priceListId: string) => updatePriceList(priceListId, { is_active: true }),
    onSuccess: (_data, priceListId) => {
      invalidateInventoryQueries(queryClient, [
        inventoryKeys.priceLists(),
        inventoryKeys.priceList(priceListId),
        inventoryKeys.priceListBranches(priceListId),
        inventoryKeys.branchPriceListsRoot(),
      ]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("inventory.price_list_update_error_fallback"),
          translateMessage: t,
        });
      }
    },
  });
}
