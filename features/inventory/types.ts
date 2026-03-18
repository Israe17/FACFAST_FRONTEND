import type { z } from "zod/v4";

import {
  brandSchema,
  cancelInventoryMovementSchema,
  createBrandSchema,
  createInventoryAdjustmentSchema,
  createInventoryLotSchema,
  createInventoryTransferSchema,
  createMeasurementUnitSchema,
  createPriceListSchema,
  createProductCategorySchema,
  createProductPriceSchema,
  createProductSchema,
  createProductVariantSchema,
  createPromotionSchema,
  createTaxProfileSchema,
  createWarehouseLocationSchema,
  createWarehouseSchema,
  createWarrantyProfileSchema,
  inventoryAdjustmentResponseSchema,
  inventoryLotSchema,
  inventoryMovementCancellationResponseSchema,
  inventoryMovementRowSchema,
  inventoryTransferResponseSchema,
  measurementUnitSchema,
  priceListSchema,
  productCategorySchema,
  productCategoryTreeSchema,
  productPriceSchema,
  productSchema,
  productVariantSchema,
  promotionItemSchema,
  promotionSchema,
  taxProfileSchema,
  updateBrandSchema,
  updateInventoryLotSchema,
  updateMeasurementUnitSchema,
  updatePriceListSchema,
  updateProductCategorySchema,
  updateProductPriceSchema,
  updateProductSchema,
  updateProductVariantSchema,
  updatePromotionSchema,
  updateTaxProfileSchema,
  updateWarehouseLocationSchema,
  updateWarehouseSchema,
  updateWarrantyProfileSchema,
  variantAttributeSchema,
  warehouseLocationSchema,
  warehouseSchema,
  warehouseStockRowSchema,
  warrantyProfileSchema,
} from "./schemas";

export type Brand = z.infer<typeof brandSchema>;
export type MeasurementUnit = z.infer<typeof measurementUnitSchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
export type ProductCategoryTreeNode = z.infer<typeof productCategoryTreeSchema>;
export type TaxProfile = z.infer<typeof taxProfileSchema>;
export type WarrantyProfile = z.infer<typeof warrantyProfileSchema>;
export type Product = z.infer<typeof productSchema>;
export type PriceList = z.infer<typeof priceListSchema>;
export type ProductPrice = z.infer<typeof productPriceSchema>;
export type PromotionItem = z.infer<typeof promotionItemSchema>;
export type Promotion = z.infer<typeof promotionSchema>;
export type Warehouse = z.infer<typeof warehouseSchema>;
export type WarehouseLocation = z.infer<typeof warehouseLocationSchema>;
export type WarehouseStockRow = z.infer<typeof warehouseStockRowSchema>;
export type InventoryLot = z.infer<typeof inventoryLotSchema>;
export type InventoryMovementRow = z.infer<typeof inventoryMovementRowSchema>;
export type InventoryAdjustmentResponse = z.infer<typeof inventoryAdjustmentResponseSchema>;
export type InventoryTransferResponse = z.infer<typeof inventoryTransferResponseSchema>;
export type InventoryMovementCancellationResponse = z.infer<
  typeof inventoryMovementCancellationResponseSchema
>;

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type CreateMeasurementUnitInput = z.infer<typeof createMeasurementUnitSchema>;
export type UpdateMeasurementUnitInput = z.infer<typeof updateMeasurementUnitSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductCategoryInput = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryInput = z.infer<typeof updateProductCategorySchema>;
export type CreateTaxProfileInput = z.infer<typeof createTaxProfileSchema>;
export type UpdateTaxProfileInput = z.infer<typeof updateTaxProfileSchema>;
export type CreateWarrantyProfileInput = z.infer<typeof createWarrantyProfileSchema>;
export type UpdateWarrantyProfileInput = z.infer<typeof updateWarrantyProfileSchema>;
export type CreatePriceListInput = z.infer<typeof createPriceListSchema>;
export type UpdatePriceListInput = z.infer<typeof updatePriceListSchema>;
export type CreateProductPriceInput = z.infer<typeof createProductPriceSchema>;
export type UpdateProductPriceInput = z.infer<typeof updateProductPriceSchema>;
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
export type CreateWarehouseLocationInput = z.infer<typeof createWarehouseLocationSchema>;
export type UpdateWarehouseLocationInput = z.infer<typeof updateWarehouseLocationSchema>;
export type CreateInventoryLotInput = z.infer<typeof createInventoryLotSchema>;
export type UpdateInventoryLotInput = z.infer<typeof updateInventoryLotSchema>;
export type CreateInventoryAdjustmentInput = z.infer<typeof createInventoryAdjustmentSchema>;
export type CreateInventoryTransferInput = z.infer<typeof createInventoryTransferSchema>;
export type CancelInventoryMovementInput = z.infer<typeof cancelInventoryMovementSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type VariantAttribute = z.infer<typeof variantAttributeSchema>;
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;
