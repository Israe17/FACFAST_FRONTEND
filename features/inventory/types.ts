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
  createPriceListBranchAssignmentSchema,
  createProductCategorySchema,
  createProductPriceSchema,
  createProductSerialsSchema,
  createProductSchema,
  createProductVariantSchema,
  createPromotionSchema,
  createPromotionBranchAssignmentSchema,
  createTaxProfileSchema,
  createWarehouseLocationSchema,
  createWarehouseSchema,
  createWarrantyProfileSchema,
  hardDeleteResponseSchema,
  inventoryAdjustmentResponseSchema,
  inventoryLotSchema,
  inventoryMovementCancellationResponseSchema,
  inventoryMovementHeaderSchema,
  inventoryMovementLineSchema,
  inventoryTransferResponseSchema,
  measurementUnitSchema,
  priceListSchema,
  priceListBranchAssignmentSchema,
  priceListBranchAssignmentsResponseSchema,
  productSerialSchema,
  productCategorySchema,
  productCategoryTreeSchema,
  productPriceSchema,
  productSchema,
  productVariantSchema,
  promotionItemSchema,
  promotionSchema,
  promotionBranchAssignmentSchema,
  promotionBranchAssignmentsResponseSchema,
  serialEventSchema,
  taxProfileSchema,
  updateBrandSchema,
  updateInventoryLotSchema,
  updateMeasurementUnitSchema,
  updatePriceListSchema,
  updatePriceListBranchAssignmentSchema,
  updateProductCategorySchema,
  updateProductPriceSchema,
  updateProductSerialStatusSchema,
  updateProductSchema,
  updateProductVariantSchema,
  updatePromotionSchema,
  updatePromotionBranchAssignmentSchema,
  updateTaxProfileSchema,
  updateWarehouseLocationSchema,
  updateWarehouseSchema,
  updateWarrantyProfileSchema,
  variantAttributeSchema,
  branchPriceListsResponseSchema,
  branchPromotionsResponseSchema,
  warehouseLocationSchema,
  warehouseSchema,
  warehouseStockRowSchema,
  warrantyProfileSchema,
  zoneSchema,
  createZoneSchema,
  updateZoneSchema,
  vehicleSchema,
  createVehicleSchema,
  updateVehicleSchema,
  routeSchema,
  createRouteSchema,
  updateRouteSchema,
  dispatchStopSchema,
  createDispatchStopSchema,
  dispatchExpenseSchema,
  createDispatchExpenseSchema,
  dispatchOrderSchema,
  createDispatchOrderSchema,
  updateDispatchOrderSchema,
} from "./schemas";

export type Brand = z.infer<typeof brandSchema>;
export type MeasurementUnit = z.infer<typeof measurementUnitSchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
export type ProductCategoryTreeNode = z.infer<typeof productCategoryTreeSchema>;
export type TaxProfile = z.infer<typeof taxProfileSchema>;
export type WarrantyProfile = z.infer<typeof warrantyProfileSchema>;
export type Product = z.infer<typeof productSchema>;
export type PriceList = z.infer<typeof priceListSchema>;
export type PriceListBranchAssignment = z.infer<typeof priceListBranchAssignmentSchema>;
export type PriceListBranchAssignmentsResponse = z.infer<
  typeof priceListBranchAssignmentsResponseSchema
>;
export type BranchPriceListsResponse = z.infer<typeof branchPriceListsResponseSchema>;
export type ProductPrice = z.infer<typeof productPriceSchema>;
export type PromotionItem = z.infer<typeof promotionItemSchema>;
export type Promotion = z.infer<typeof promotionSchema>;
export type PromotionBranchAssignment = z.infer<typeof promotionBranchAssignmentSchema>;
export type PromotionBranchAssignmentsResponse = z.infer<
  typeof promotionBranchAssignmentsResponseSchema
>;
export type BranchPromotionsResponse = z.infer<typeof branchPromotionsResponseSchema>;
export type Warehouse = z.infer<typeof warehouseSchema>;
export type WarehouseLocation = z.infer<typeof warehouseLocationSchema>;
export type WarehouseStockRow = z.infer<typeof warehouseStockRowSchema>;
export type InventoryLot = z.infer<typeof inventoryLotSchema>;
export type InventoryMovementLine = z.infer<typeof inventoryMovementLineSchema>;
export type InventoryMovementHeader = z.infer<typeof inventoryMovementHeaderSchema>;
export type InventoryMovementRow = InventoryMovementHeader;
export type InventoryAdjustmentResponse = z.infer<typeof inventoryAdjustmentResponseSchema>;
export type InventoryTransferResponse = z.infer<typeof inventoryTransferResponseSchema>;
export type InventoryMovementCancellationResponse = z.infer<
  typeof inventoryMovementCancellationResponseSchema
>;
export type ProductSerial = z.infer<typeof productSerialSchema>;
export type SerialEvent = z.infer<typeof serialEventSchema>;
export type HardDeleteResponse = z.infer<typeof hardDeleteResponseSchema>;

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
export type CreatePriceListBranchAssignmentInput = z.infer<
  typeof createPriceListBranchAssignmentSchema
>;
export type UpdatePriceListInput = z.infer<typeof updatePriceListSchema>;
export type UpdatePriceListBranchAssignmentInput = z.infer<
  typeof updatePriceListBranchAssignmentSchema
>;
export type CreateProductPriceInput = z.infer<typeof createProductPriceSchema>;
export type CreateProductSerialsInput = z.infer<typeof createProductSerialsSchema>;
export type UpdateProductPriceInput = z.infer<typeof updateProductPriceSchema>;
export type UpdateProductSerialStatusInput = z.infer<typeof updateProductSerialStatusSchema>;
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type CreatePromotionBranchAssignmentInput = z.infer<
  typeof createPromotionBranchAssignmentSchema
>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type UpdatePromotionBranchAssignmentInput = z.infer<
  typeof updatePromotionBranchAssignmentSchema
>;
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
export type Zone = z.infer<typeof zoneSchema>;
export type CreateZoneInput = z.infer<typeof createZoneSchema>;
export type UpdateZoneInput = z.infer<typeof updateZoneSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type Route = z.infer<typeof routeSchema>;
export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
export type DispatchStop = z.infer<typeof dispatchStopSchema>;
export type CreateDispatchStopInput = z.infer<typeof createDispatchStopSchema>;
export type DispatchExpense = z.infer<typeof dispatchExpenseSchema>;
export type CreateDispatchExpenseInput = z.infer<typeof createDispatchExpenseSchema>;
export type DispatchOrder = z.infer<typeof dispatchOrderSchema>;
export type CreateDispatchOrderInput = z.infer<typeof createDispatchOrderSchema>;
export type UpdateDispatchOrderInput = z.infer<typeof updateDispatchOrderSchema>;
