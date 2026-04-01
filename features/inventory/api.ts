import { http } from "@/shared/lib/http";
import { extractCollection, extractEntity, compactRecord, compactNullableRecord, toNumberId } from "@/shared/lib/api-helpers";
import { withIdempotencyKey } from "@/shared/lib/idempotency";
import { paginatedSchema, cursorSchema, type PaginatedQueryParams, type CursorQueryParams } from "@/shared/lib/api-types";

import {
  brandSchema,
  hardDeleteResponseSchema,
  inventoryAdjustmentResponseSchema,
  inventoryLotSchema,
  inventoryMovementCancellationResponseSchema,
  inventoryMovementHeaderSchema,
  inventoryTransferResponseSchema,
  measurementUnitSchema,
  priceListSchema,
  priceListBranchAssignmentSchema,
  priceListBranchAssignmentsResponseSchema,
  productCategorySchema,
  productCategoryTreeSchema,
  productPriceSchema,
  productSerialSchema,
  productSchema,
  productVariantSchema,
  promotionSchema,
  promotionBranchAssignmentSchema,
  promotionBranchAssignmentsResponseSchema,
  taxProfileSchema,
  variantAttributeSchema,
  branchPriceListsResponseSchema,
  branchPromotionsResponseSchema,
  warehouseLocationSchema,
  warehouseSchema,
  warehouseStockRowSchema,
  warrantyProfileSchema,
  branchAssignmentsViewSchema,
  zoneSchema,
  vehicleSchema,
  routeSchema,
  dispatchOrderSchema,
} from "./schemas";
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
  SetBranchAssignmentsInput,
  CreateZoneInput,
  UpdateZoneInput,
  CreateVehicleInput,
  UpdateVehicleInput,
  CreateRouteInput,
  UpdateRouteInput,
  CreateDispatchOrderInput,
  UpdateDispatchOrderInput,
  CreateDispatchStopInput,
  CreateDispatchExpenseInput,
  UpdateDispatchStopStatusInput,
} from "./types";


function toOptionalNumberId(value: string | number | null | undefined) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return Number(value);
}

function toOptionalIsoDateTime(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function toOptionalDateString(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  return value.slice(0, 10);
}

function buildBrandPayload(payload: CreateBrandInput | UpdateBrandInput) {
  return compactRecord({
    code: payload.code,
    description: payload.description,
    is_active: payload.is_active,
    name: payload.name,
  });
}

function buildMeasurementUnitPayload(
  payload: CreateMeasurementUnitInput | UpdateMeasurementUnitInput,
) {
  return compactRecord({
    code: payload.code,
    is_active: payload.is_active,
    name: payload.name,
    symbol: payload.symbol,
  });
}

function buildProductCategoryPayload(
  payload: CreateProductCategoryInput | UpdateProductCategoryInput,
) {
  return compactRecord({
    code: payload.code,
    description: payload.description,
    is_active: payload.is_active,
    name: payload.name,
    parent_id: toOptionalNumberId(payload.parent_id),
  });
}

function buildTaxProfilePayload(payload: CreateTaxProfileInput | UpdateTaxProfileInput) {
  const isIva = payload.tax_type === "iva";
  const isSpecificTax = payload.tax_type === "specific_tax";

  return compactRecord({
    allows_exoneration: payload.allows_exoneration,
    cabys_code: payload.cabys_code,
    code: payload.code,
    description: payload.description,
    has_specific_tax: isSpecificTax,
    is_active: payload.is_active,
    item_kind: payload.item_kind,
    iva_rate: isIva ? payload.iva_rate : undefined,
    iva_rate_code: isIva ? payload.iva_rate_code : undefined,
    name: payload.name,
    requires_cabys: payload.requires_cabys,
    specific_tax_name: isSpecificTax ? payload.specific_tax_name : undefined,
    specific_tax_rate: isSpecificTax ? payload.specific_tax_rate : undefined,
    tax_type: payload.tax_type,
  });
}

function buildWarrantyProfilePayload(
  payload: CreateWarrantyProfileInput | UpdateWarrantyProfileInput,
) {
  return compactRecord({
    code: payload.code,
    coverage_notes: payload.coverage_notes,
    duration_unit: payload.duration_unit,
    duration_value: payload.duration_value,
    is_active: payload.is_active,
    name: payload.name,
  });
}

function buildProductPayload(payload: CreateProductInput | UpdateProductInput) {
  const isProduct = payload.type === "product";

  return compactRecord({
    allow_negative_stock: isProduct ? payload.allow_negative_stock : false,
    barcode: payload.barcode,
    brand_id: toOptionalNumberId(payload.brand_id),
    category_id: toOptionalNumberId(payload.category_id),
    code: payload.code,
    description: payload.description,
    has_variants: isProduct ? payload.has_variants : false,
    has_warranty: payload.has_warranty,
    is_active: payload.is_active,
    name: payload.name,
    sale_unit_id: toOptionalNumberId(payload.sale_unit_id),
    sku: payload.sku,
    stock_unit_id: toOptionalNumberId(payload.stock_unit_id),
    tax_profile_id: toOptionalNumberId(payload.tax_profile_id),
    track_expiration: isProduct ? payload.track_expiration : false,
    track_inventory: isProduct ? payload.track_inventory : false,
    track_lots: isProduct ? payload.track_lots : false,
    track_serials: isProduct ? payload.track_serials : false,
    type: payload.type,
    warranty_profile_id: payload.has_warranty
      ? toOptionalNumberId(payload.warranty_profile_id)
      : undefined,
  });
}

function buildPriceListPayload(payload: CreatePriceListInput | UpdatePriceListInput) {
  return compactRecord({
    code: payload.code,
    currency: payload.currency,
    is_active: payload.is_active,
    is_default: payload.is_default,
    kind: payload.kind,
    name: payload.name,
  });
}

function buildProductPricePayload(payload: CreateProductPriceInput | UpdateProductPriceInput) {
  return compactRecord({
    is_active: payload.is_active,
    min_quantity: payload.min_quantity,
    price: payload.price,
    price_list_id: toOptionalNumberId(payload.price_list_id),
    product_variant_id: toOptionalNumberId(payload.product_variant_id),
    valid_from: toOptionalIsoDateTime(payload.valid_from),
    valid_to: toOptionalIsoDateTime(payload.valid_to),
  });
}

function buildPriceListBranchAssignmentPayload(
  payload: CreatePriceListBranchAssignmentInput | UpdatePriceListBranchAssignmentInput,
) {
  return compactNullableRecord({
    branch_id: "branch_id" in payload ? toOptionalNumberId(payload.branch_id) : undefined,
    is_active: payload.is_active,
    is_default: payload.is_default,
    notes: payload.notes === "" ? null : payload.notes,
  });
}

function buildPromotionPayload(payload: CreatePromotionInput | UpdatePromotionInput) {
  return compactRecord({
    code: payload.code,
    is_active: payload.is_active,
    items: payload.items?.map((item) =>
      compactRecord({
        bonus_quantity: item.bonus_quantity,
        discount_value: item.discount_value,
        min_quantity: item.min_quantity,
        override_price: item.override_price,
        product_id: toOptionalNumberId(item.product_id),
        product_variant_id: toOptionalNumberId(item.product_variant_id),
      }),
    ),
    name: payload.name,
    type: payload.type,
    valid_from: payload.valid_from ? toOptionalIsoDateTime(payload.valid_from) : undefined,
    valid_to: payload.valid_to ? toOptionalIsoDateTime(payload.valid_to) : undefined,
  });
}

function buildWarehousePayload(payload: CreateWarehouseInput | UpdateWarehouseInput) {
  return compactRecord({
    branch_id: toOptionalNumberId(payload.branch_id),
    code: payload.code,
    description: payload.description,
    is_active: payload.is_active,
    is_default: payload.is_default,
    name: payload.name,
    uses_locations: payload.uses_locations,
  });
}

function buildWarehouseLocationPayload(
  payload: CreateWarehouseLocationInput | UpdateWarehouseLocationInput,
) {
  return compactRecord({
    aisle: payload.aisle,
    barcode: payload.barcode,
    code: payload.code,
    description: payload.description,
    is_active: payload.is_active,
    is_dispatch_area: payload.is_dispatch_area,
    is_picking_area: payload.is_picking_area,
    is_receiving_area: payload.is_receiving_area,
    level: payload.level,
    name: payload.name,
    position: payload.position,
    rack: payload.rack,
    zone: payload.zone,
  });
}

function buildInventoryLotCreatePayload(payload: CreateInventoryLotInput) {
  return compactRecord({
    code: payload.code,
    expiration_date: toOptionalDateString(payload.expiration_date),
    initial_quantity: payload.initial_quantity,
    is_active: payload.is_active,
    location_id: toOptionalNumberId(payload.location_id),
    lot_number: payload.lot_number,
    manufacturing_date: toOptionalDateString(payload.manufacturing_date),
    product_id: toOptionalNumberId(payload.product_id),
    product_variant_id: toOptionalNumberId(payload.product_variant_id),
    received_at: toOptionalIsoDateTime(payload.received_at),
    supplier_contact_id: toOptionalNumberId(payload.supplier_contact_id),
    unit_cost: payload.unit_cost,
    warehouse_id: toOptionalNumberId(payload.warehouse_id),
  });
}

function buildInventoryLotUpdatePayload(payload: CreateInventoryLotInput | UpdateInventoryLotInput) {
  return compactRecord({
    code: payload.code,
    expiration_date: toOptionalDateString(payload.expiration_date),
    is_active: payload.is_active,
    location_id: toOptionalNumberId(payload.location_id),
    lot_number: payload.lot_number,
    manufacturing_date: toOptionalDateString(payload.manufacturing_date),
    received_at: toOptionalIsoDateTime(payload.received_at),
    supplier_contact_id: toOptionalNumberId(payload.supplier_contact_id),
    unit_cost: payload.unit_cost,
  });
}

function buildInventoryAdjustmentPayload(payload: CreateInventoryAdjustmentInput) {
  return compactRecord({
    inventory_lot_id: toOptionalNumberId(payload.inventory_lot_id),
    location_id: toOptionalNumberId(payload.location_id),
    movement_type: payload.movement_type,
    notes: payload.notes,
    product_id: toOptionalNumberId(payload.product_id),
    product_variant_id: toOptionalNumberId(payload.product_variant_id),
    quantity: payload.quantity,
    reference_id: payload.reference_id,
    reference_type: payload.reference_type,
    warehouse_id: toOptionalNumberId(payload.warehouse_id),
  });
}

function buildInventoryTransferPayload(payload: CreateInventoryTransferInput) {
  return compactRecord({
    destination_warehouse_id: toOptionalNumberId(payload.destination_warehouse_id),
    destination_location_id: toOptionalNumberId(payload.destination_location_id),
    inventory_lot_id: toOptionalNumberId(payload.inventory_lot_id),
    notes: payload.notes,
    origin_location_id: toOptionalNumberId(payload.origin_location_id),
    origin_warehouse_id: toOptionalNumberId(payload.origin_warehouse_id),
    product_id: toOptionalNumberId(payload.product_id),
    product_variant_id: toOptionalNumberId(payload.product_variant_id),
    quantity: payload.quantity,
    reference_id: payload.reference_id,
    reference_type: payload.reference_type,
    serial_ids: payload.serial_ids,
    unit_cost: payload.unit_cost,
  });
}

function buildPromotionBranchAssignmentPayload(
  payload: CreatePromotionBranchAssignmentInput | UpdatePromotionBranchAssignmentInput,
) {
  return compactNullableRecord({
    branch_id: "branch_id" in payload ? toOptionalNumberId(payload.branch_id) : undefined,
    is_active: payload.is_active,
    notes: payload.notes === "" ? null : payload.notes,
  });
}

export async function listBrands() {
  const response = await http.get("/brands");
  return extractCollection(response.data, ["brands"]).map((item) => brandSchema.parse(item));
}

export async function createBrand(payload: CreateBrandInput) {
  const response = await http.post("/brands", buildBrandPayload(payload));
  return brandSchema.parse(extractEntity(response.data, ["brand"]));
}

export async function updateBrand(
  brandId: string,
  payload: CreateBrandInput | UpdateBrandInput,
) {
  const response = await http.patch(`/brands/${brandId}`, buildBrandPayload(payload));
  return brandSchema.parse(extractEntity(response.data, ["brand"]));
}

export async function deleteBrand(brandId: string) {
  await http.delete(`/brands/${brandId}`);
}

export async function listMeasurementUnits() {
  const response = await http.get("/measurement-units");
  return extractCollection(response.data, ["measurement_units", "measurementUnits"]).map((item) =>
    measurementUnitSchema.parse(item),
  );
}

export async function createMeasurementUnit(payload: CreateMeasurementUnitInput) {
  const response = await http.post("/measurement-units", buildMeasurementUnitPayload(payload));
  return measurementUnitSchema.parse(
    extractEntity(response.data, ["measurement_unit", "measurementUnit"]),
  );
}

export async function updateMeasurementUnit(
  measurementUnitId: string,
  payload: CreateMeasurementUnitInput | UpdateMeasurementUnitInput,
) {
  const response = await http.patch(
    `/measurement-units/${measurementUnitId}`,
    buildMeasurementUnitPayload(payload),
  );
  return measurementUnitSchema.parse(
    extractEntity(response.data, ["measurement_unit", "measurementUnit"]),
  );
}

export async function deleteMeasurementUnit(measurementUnitId: string) {
  await http.delete(`/measurement-units/${measurementUnitId}`);
}

export async function listProductCategories() {
  const response = await http.get("/product-categories");
  return extractCollection(response.data, ["product_categories", "productCategories"]).map((item) =>
    productCategorySchema.parse(item),
  );
}

export async function listProductCategoryTree() {
  const response = await http.get("/product-categories/tree");
  return extractCollection(response.data, ["product_categories", "productCategories"]).map((item) =>
    productCategoryTreeSchema.parse(item),
  );
}

export async function createProductCategory(payload: CreateProductCategoryInput) {
  const response = await http.post("/product-categories", buildProductCategoryPayload(payload));
  return productCategorySchema.parse(
    extractEntity(response.data, ["product_category", "productCategory"]),
  );
}

export async function updateProductCategory(
  categoryId: string,
  payload: CreateProductCategoryInput | UpdateProductCategoryInput,
) {
  const response = await http.patch(
    `/product-categories/${categoryId}`,
    buildProductCategoryPayload(payload),
  );
  return productCategorySchema.parse(
    extractEntity(response.data, ["product_category", "productCategory"]),
  );
}

export async function deleteProductCategory(categoryId: string) {
  await http.delete(`/product-categories/${categoryId}`);
}

export async function listTaxProfiles() {
  const response = await http.get("/tax-profiles");
  return extractCollection(response.data, ["tax_profiles", "taxProfiles"]).map((item) =>
    taxProfileSchema.parse(item),
  );
}

export async function createTaxProfile(payload: CreateTaxProfileInput) {
  const response = await http.post("/tax-profiles", buildTaxProfilePayload(payload));
  return taxProfileSchema.parse(extractEntity(response.data, ["tax_profile", "taxProfile"]));
}

export async function updateTaxProfile(
  taxProfileId: string,
  payload: CreateTaxProfileInput | UpdateTaxProfileInput,
) {
  const response = await http.patch(`/tax-profiles/${taxProfileId}`, buildTaxProfilePayload(payload));
  return taxProfileSchema.parse(extractEntity(response.data, ["tax_profile", "taxProfile"]));
}

export async function listWarrantyProfiles() {
  const response = await http.get("/warranty-profiles");
  return extractCollection(response.data, ["warranty_profiles", "warrantyProfiles"]).map((item) =>
    warrantyProfileSchema.parse(item),
  );
}

export async function createWarrantyProfile(payload: CreateWarrantyProfileInput) {
  const response = await http.post("/warranty-profiles", buildWarrantyProfilePayload(payload));
  return warrantyProfileSchema.parse(
    extractEntity(response.data, ["warranty_profile", "warrantyProfile"]),
  );
}

export async function updateWarrantyProfile(
  warrantyProfileId: string,
  payload: CreateWarrantyProfileInput | UpdateWarrantyProfileInput,
) {
  const response = await http.patch(
    `/warranty-profiles/${warrantyProfileId}`,
    buildWarrantyProfilePayload(payload),
  );
  return warrantyProfileSchema.parse(
    extractEntity(response.data, ["warranty_profile", "warrantyProfile"]),
  );
}

export async function deleteWarrantyProfile(warrantyProfileId: string) {
  await http.delete(`/warranty-profiles/${warrantyProfileId}`);
}

export async function listProducts() {
  const response = await http.get("/products");
  return extractCollection(response.data, ["products"]).map((item) => productSchema.parse(item));
}

export async function getProduct(productId: string) {
  const response = await http.get(`/products/${productId}`);
  return productSchema.parse(extractEntity(response.data, ["product"]));
}

export async function createProduct(payload: CreateProductInput) {
  const response = await http.post("/products", buildProductPayload(payload));
  return productSchema.parse(extractEntity(response.data, ["product"]));
}

export async function updateProduct(
  productId: string,
  payload: CreateProductInput | UpdateProductInput,
) {
  const response = await http.patch(`/products/${productId}`, buildProductPayload(payload));
  return productSchema.parse(extractEntity(response.data, ["product"]));
}

export async function deactivateProduct(productId: string) {
  const response = await http.delete(`/products/${productId}`);
  return productSchema.parse(extractEntity(response.data, ["product"]));
}

export async function listPriceLists() {
  const response = await http.get("/price-lists");
  return extractCollection(response.data, ["price_lists", "priceLists"]).map((item) =>
    priceListSchema.parse(item),
  );
}

export async function getPriceList(priceListId: string) {
  const response = await http.get(`/price-lists/${priceListId}`);
  return priceListSchema.parse(extractEntity(response.data, ["price_list", "priceList"]));
}

export async function createPriceList(payload: CreatePriceListInput) {
  const response = await http.post("/price-lists", buildPriceListPayload(payload));
  return priceListSchema.parse(extractEntity(response.data, ["price_list", "priceList"]));
}

export async function updatePriceList(
  priceListId: string,
  payload: CreatePriceListInput | UpdatePriceListInput,
) {
  const response = await http.patch(`/price-lists/${priceListId}`, buildPriceListPayload(payload));
  return priceListSchema.parse(extractEntity(response.data, ["price_list", "priceList"]));
}

export async function deletePriceList(priceListId: string) {
  await http.delete(`/price-lists/${priceListId}`);
}

export async function listPriceListBranchAssignments(priceListId: string) {
  const response = await http.get(`/price-lists/${priceListId}/branches`);
  return priceListBranchAssignmentsResponseSchema.parse(extractEntity(response.data));
}

export async function listBranchPriceLists(branchId: string) {
  const response = await http.get(`/branches/${branchId}/price-lists`);
  return branchPriceListsResponseSchema.parse(extractEntity(response.data));
}

export async function createPriceListBranchAssignment(
  priceListId: string,
  payload: CreatePriceListBranchAssignmentInput,
) {
  const response = await http.post(
    `/price-lists/${priceListId}/branches`,
    buildPriceListBranchAssignmentPayload(payload),
  );
  return priceListBranchAssignmentSchema.parse(extractEntity(response.data, ["assignment"]));
}

export async function updatePriceListBranchAssignment(
  priceListId: string,
  assignmentId: string,
  payload: CreatePriceListBranchAssignmentInput | UpdatePriceListBranchAssignmentInput,
) {
  const response = await http.patch(
    `/price-lists/${priceListId}/branches/${assignmentId}`,
    buildPriceListBranchAssignmentPayload(payload),
  );
  return priceListBranchAssignmentSchema.parse(extractEntity(response.data, ["assignment"]));
}

export async function deletePriceListBranchAssignment(
  priceListId: string,
  assignmentId: string,
) {
  const response = await http.delete(`/price-lists/${priceListId}/branches/${assignmentId}`);
  return hardDeleteResponseSchema.parse(extractEntity(response.data));
}

export async function listProductPrices(productId: string) {
  const response = await http.get(`/products/${productId}/prices`);
  return extractCollection(response.data, ["product_prices", "productPrices"]).map((item) =>
    productPriceSchema.parse(item),
  );
}

export async function createProductPrice(
  productId: string,
  payload: CreateProductPriceInput,
) {
  const response = await http.post(
    `/products/${productId}/prices`,
    buildProductPricePayload(payload),
  );
  return productPriceSchema.parse(extractEntity(response.data, ["product_price", "productPrice"]));
}

export async function deleteProductPrice(productPriceId: string) {
  await http.delete(`/product-prices/${productPriceId}`);
}

export async function updateProductPrice(
  productPriceId: string,
  payload: CreateProductPriceInput | UpdateProductPriceInput,
) {
  const response = await http.patch(
    `/product-prices/${productPriceId}`,
    buildProductPricePayload(payload),
  );
  return productPriceSchema.parse(extractEntity(response.data, ["product_price", "productPrice"]));
}

export async function listPromotions() {
  const response = await http.get("/promotions");
  return extractCollection(response.data, ["promotions"]).map((item) => promotionSchema.parse(item));
}

export async function createPromotion(payload: CreatePromotionInput) {
  const response = await http.post("/promotions", buildPromotionPayload(payload));
  return promotionSchema.parse(extractEntity(response.data, ["promotion"]));
}

export async function updatePromotion(
  promotionId: string,
  payload: CreatePromotionInput | UpdatePromotionInput,
) {
  const response = await http.patch(`/promotions/${promotionId}`, buildPromotionPayload(payload));
  return promotionSchema.parse(extractEntity(response.data, ["promotion"]));
}

export async function deletePromotion(promotionId: string) {
  await http.delete(`/promotions/${promotionId}`);
}

export async function listPromotionBranchAssignments(promotionId: string) {
  const response = await http.get(`/promotions/${promotionId}/branches`);
  return promotionBranchAssignmentsResponseSchema.parse(extractEntity(response.data));
}

export async function listBranchPromotions(branchId: string) {
  const response = await http.get(`/branches/${branchId}/promotions`);
  return branchPromotionsResponseSchema.parse(extractEntity(response.data));
}

export async function createPromotionBranchAssignment(
  promotionId: string,
  payload: CreatePromotionBranchAssignmentInput,
) {
  const response = await http.post(
    `/promotions/${promotionId}/branches`,
    buildPromotionBranchAssignmentPayload(payload),
  );
  return promotionBranchAssignmentSchema.parse(extractEntity(response.data, ["assignment"]));
}

export async function updatePromotionBranchAssignment(
  promotionId: string,
  assignmentId: string,
  payload: CreatePromotionBranchAssignmentInput | UpdatePromotionBranchAssignmentInput,
) {
  const response = await http.patch(
    `/promotions/${promotionId}/branches/${assignmentId}`,
    buildPromotionBranchAssignmentPayload(payload),
  );
  return promotionBranchAssignmentSchema.parse(extractEntity(response.data, ["assignment"]));
}

export async function deletePromotionBranchAssignment(
  promotionId: string,
  assignmentId: string,
) {
  const response = await http.delete(`/promotions/${promotionId}/branches/${assignmentId}`);
  return hardDeleteResponseSchema.parse(extractEntity(response.data));
}

export async function listWarehouses() {
  const response = await http.get("/warehouses");
  return extractCollection(response.data, ["warehouses"]).map((item) => warehouseSchema.parse(item));
}

export async function getWarehouse(warehouseId: string) {
  const response = await http.get(`/warehouses/${warehouseId}`);
  return warehouseSchema.parse(extractEntity(response.data, ["warehouse"]));
}

export async function createWarehouse(payload: CreateWarehouseInput) {
  const response = await http.post("/warehouses", buildWarehousePayload(payload));
  return warehouseSchema.parse(extractEntity(response.data, ["warehouse"]));
}

export async function updateWarehouse(
  warehouseId: string,
  payload: CreateWarehouseInput | UpdateWarehouseInput,
) {
  const response = await http.patch(`/warehouses/${warehouseId}`, buildWarehousePayload(payload));
  return warehouseSchema.parse(extractEntity(response.data, ["warehouse"]));
}

export async function deactivateWarehouse(warehouseId: string) {
  const response = await http.delete(`/warehouses/${warehouseId}`);
  return warehouseSchema.parse(extractEntity(response.data, ["warehouse"]));
}

export async function listWarehouseLocations(warehouseId: string) {
  const response = await http.get(`/warehouses/${warehouseId}/locations`);
  return extractCollection(response.data, ["locations", "warehouse_locations", "warehouseLocations"]).map(
    (item) => warehouseLocationSchema.parse(item),
  );
}

export async function createWarehouseLocation(
  warehouseId: string,
  payload: CreateWarehouseLocationInput,
) {
  const response = await http.post(
    `/warehouses/${warehouseId}/locations`,
    buildWarehouseLocationPayload(payload),
  );
  return warehouseLocationSchema.parse(
    extractEntity(response.data, ["location", "warehouse_location", "warehouseLocation"]),
  );
}

export async function updateWarehouseLocation(
  warehouseLocationId: string,
  payload: CreateWarehouseLocationInput | UpdateWarehouseLocationInput,
) {
  const response = await http.patch(
    `/warehouse-locations/${warehouseLocationId}`,
    buildWarehouseLocationPayload(payload),
  );
  return warehouseLocationSchema.parse(
    extractEntity(response.data, ["location", "warehouse_location", "warehouseLocation"]),
  );
}

export async function listWarehouseStock() {
  const response = await http.get("/warehouse-stock");
  return extractCollection(response.data, ["rows", "stock", "warehouse_stock"]).map((item) =>
    warehouseStockRowSchema.parse(item),
  );
}

export async function listWarehouseStockByWarehouse(warehouseId: string) {
  const response = await http.get(`/warehouse-stock/${warehouseId}/products`);
  return extractCollection(response.data, ["rows", "stock", "warehouse_stock"]).map((item) =>
    warehouseStockRowSchema.parse(item),
  );
}

export async function listInventoryLots() {
  const response = await http.get("/inventory-lots");
  return extractCollection(response.data, ["inventory_lots", "inventoryLots"]).map((item) =>
    inventoryLotSchema.parse(item),
  );
}

export async function createInventoryLot(payload: CreateInventoryLotInput) {
  const response = await http.post("/inventory-lots", buildInventoryLotCreatePayload(payload));
  return inventoryLotSchema.parse(extractEntity(response.data, ["inventory_lot", "inventoryLot"]));
}

export async function updateInventoryLot(
  inventoryLotId: string,
  payload: CreateInventoryLotInput | UpdateInventoryLotInput,
) {
  const response = await http.patch(
    `/inventory-lots/${inventoryLotId}`,
    buildInventoryLotUpdatePayload(payload),
  );
  return inventoryLotSchema.parse(extractEntity(response.data, ["inventory_lot", "inventoryLot"]));
}

export async function deactivateInventoryLot(inventoryLotId: string) {
  const response = await http.delete(`/inventory-lots/${inventoryLotId}`);
  return inventoryLotSchema.parse(extractEntity(response.data, ["inventory_lot", "inventoryLot"]));
}

export async function listInventoryMovements() {
  const response = await http.get("/inventory-movements");
  return extractCollection(response.data).map((item) =>
    inventoryMovementHeaderSchema.parse(item),
  );
}

export async function getInventoryMovement(movementHeaderId: string) {
  const response = await http.get(`/inventory-movements/${movementHeaderId}`);
  return inventoryMovementHeaderSchema.parse(extractEntity(response.data));
}

export async function createInventoryAdjustment(payload: CreateInventoryAdjustmentInput) {
  const response = await http.post(
    "/inventory-movements/adjust",
    buildInventoryAdjustmentPayload(payload),
  );
  return inventoryAdjustmentResponseSchema.parse(
    extractEntity(response.data, ["movement", "inventory_movement", "inventoryMovement"]),
  );
}

export async function createInventoryTransfer(payload: CreateInventoryTransferInput) {
  const response = await http.post(
    "/inventory-movements/transfer",
    buildInventoryTransferPayload(payload),
  );
  return inventoryTransferResponseSchema.parse(extractEntity(response.data));
}

export async function cancelInventoryMovement(
  movementHeaderId: string,
  payload: CancelInventoryMovementInput,
) {
  const response = await http.post(
    `/inventory-movements/${movementHeaderId}/cancel`,
    compactRecord({ notes: payload.notes }),
  );
  return inventoryMovementCancellationResponseSchema.parse(extractEntity(response.data));
}

// --- Paginated & Cursor API functions ---

export async function listProductsPaginated(params: PaginatedQueryParams) {
  const response = await http.get("/products", { params });
  return paginatedSchema(productSchema).parse(response.data);
}

export async function listProductsCursor(params: CursorQueryParams) {
  const response = await http.get("/products/cursor", { params });
  return cursorSchema(productSchema).parse(response.data);
}

export async function listInventoryLotsPaginated(params: PaginatedQueryParams) {
  const response = await http.get("/inventory-lots", { params });
  return paginatedSchema(inventoryLotSchema).parse(response.data);
}

export async function listInventoryLotsCursor(params: CursorQueryParams) {
  const response = await http.get("/inventory-lots/cursor", { params });
  return cursorSchema(inventoryLotSchema).parse(response.data);
}

export async function listInventoryMovementsPaginated(params: PaginatedQueryParams) {
  const response = await http.get("/inventory-movements", { params });
  return paginatedSchema(inventoryMovementHeaderSchema).parse(response.data);
}

export async function listInventoryMovementsCursor(params: CursorQueryParams) {
  const response = await http.get("/inventory-movements/cursor", { params });
  return cursorSchema(inventoryMovementHeaderSchema).parse(response.data);
}

export async function listDispatchOrdersPaginated(params: PaginatedQueryParams) {
  const response = await http.get("/dispatch-orders", { params });
  return paginatedSchema(dispatchOrderSchema).parse(response.data);
}

export async function listDispatchOrdersCursor(params: CursorQueryParams) {
  const response = await http.get("/dispatch-orders/cursor", { params });
  return cursorSchema(dispatchOrderSchema).parse(response.data);
}

export async function listWarehouseStockPaginated(params: PaginatedQueryParams) {
  const response = await http.get("/warehouse-stock", { params });
  return paginatedSchema(warehouseStockRowSchema).parse(response.data);
}

export async function listWarehouseStockCursor(params: CursorQueryParams) {
  const response = await http.get("/warehouse-stock/cursor", { params });
  return cursorSchema(warehouseStockRowSchema).parse(response.data);
}

export async function listWarehouseStockByWarehouseCursor(warehouseId: string, params: CursorQueryParams) {
  const response = await http.get(`/warehouse-stock/by-warehouse/${warehouseId}/cursor`, { params });
  return cursorSchema(warehouseStockRowSchema).parse(response.data);
}

function buildProductVariantPayload(
  payload: CreateProductVariantInput | UpdateProductVariantInput,
) {
  return compactRecord({
    allow_negative_stock: payload.allow_negative_stock,
    barcode: payload.barcode,
    default_warranty_profile_id: toOptionalNumberId(payload.default_warranty_profile_id),
    fiscal_profile_id: toOptionalNumberId(payload.fiscal_profile_id),
    is_active: payload.is_active,
    sale_unit_measure_id: toOptionalNumberId(payload.sale_unit_measure_id),
    sku: payload.sku,
    stock_unit_measure_id: toOptionalNumberId(payload.stock_unit_measure_id),
    track_expiration: payload.track_expiration,
    track_inventory: payload.track_inventory,
    track_lots: payload.track_lots,
    track_serials: payload.track_serials,
    variant_name: payload.variant_name,
  });
}

export async function listProductVariants(productId: string) {
  const response = await http.get(`/products/${productId}/variants`);
  return extractCollection(response.data, ["variants"]).map((item) =>
    productVariantSchema.parse(item),
  );
}

export async function createProductVariant(
  productId: string,
  payload: CreateProductVariantInput,
) {
  const response = await http.post(
    `/products/${productId}/variants`,
    buildProductVariantPayload(payload),
  );
  return productVariantSchema.parse(extractEntity(response.data, ["variant"]));
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  payload: CreateProductVariantInput | UpdateProductVariantInput,
) {
  const response = await http.patch(
    `/products/${productId}/variants/${variantId}`,
    buildProductVariantPayload(payload),
  );
  return productVariantSchema.parse(extractEntity(response.data, ["variant"]));
}

export async function listVariantAttributes(productId: string) {
  const response = await http.get(`/products/${productId}/attributes`);
  return extractCollection(response.data, ["attributes"]).map((item) =>
    variantAttributeSchema.parse(item),
  );
}

export async function setVariantAttributes(
  productId: string,
  attributes: { name: string; display_order?: number; values: { value: string; display_order?: number }[] }[],
) {
  const response = await http.put(`/products/${productId}/attributes`, { attributes });
  return extractCollection(response.data, ["attributes"]).map((item) =>
    variantAttributeSchema.parse(item),
  );
}

export async function generateVariantsFromAttributes(productId: string) {
  const response = await http.post(`/products/${productId}/attributes/generate-variants`);
  return extractCollection(response.data, ["variants"]).map((item) =>
    productVariantSchema.parse(item),
  );
}

export async function deactivateProductVariant(productId: string, variantId: string) {
  const response = await http.delete(`/products/${productId}/variants/${variantId}`);
  return productVariantSchema.parse(extractEntity(response.data, ["variant"]));
}

export async function deleteProductVariantPermanent(productId: string, variantId: string) {
  const response = await http.delete(`/products/${productId}/variants/${variantId}/permanent`);
  return hardDeleteResponseSchema.parse(extractEntity(response.data));
}

export async function listProductSerials(
  productId: string,
  variantId: string,
  params: { status?: string; warehouse_id?: string } = {},
) {
  const response = await http.get(`/products/${productId}/variants/${variantId}/serials`, {
    params: compactRecord({
      status: params.status,
      warehouse_id: toOptionalNumberId(params.warehouse_id),
    }),
  });

  return extractCollection(response.data, ["serials", "product_serials", "productSerials"]).map(
    (item) => productSerialSchema.parse(item),
  );
}

export async function createProductSerials(
  productId: string,
  variantId: string,
  payload: CreateProductSerialsInput,
) {
  const response = await http.post(`/products/${productId}/variants/${variantId}/serials`, {
    serial_numbers: payload.serial_numbers,
    warehouse_id: toOptionalNumberId(payload.warehouse_id),
  });

  return extractCollection(response.data, ["serials", "product_serials", "productSerials"]).map(
    (item) => productSerialSchema.parse(item),
  );
}

export async function updateProductSerial(
  serialId: string,
  payload: UpdateProductSerialStatusInput,
) {
  const response = await http.patch(
    `/product-serials/${serialId}`,
    compactRecord({
      notes: payload.notes,
      status: payload.status,
    }),
  );

  return productSerialSchema.parse(
    extractEntity(response.data, ["serial", "product_serial", "productSerial"]),
  );
}

// --- Zones ---

function buildZonePayload(payload: CreateZoneInput | UpdateZoneInput) {
  return compactRecord({
    canton: payload.canton,
    code: payload.code,
    description: payload.description,
    district: payload.district,
    is_active: payload.is_active,
    name: payload.name,
    province: payload.province,
  });
}

export async function listZones() {
  const response = await http.get("/zones");
  return extractCollection(response.data, ["zones"]).map((item) => zoneSchema.parse(item));
}

export async function createZone(payload: CreateZoneInput) {
  const response = await http.post("/zones", buildZonePayload(payload));
  return zoneSchema.parse(extractEntity(response.data, ["zone"]));
}

export async function updateZone(zoneId: string, payload: CreateZoneInput | UpdateZoneInput) {
  const response = await http.patch(`/zones/${zoneId}`, buildZonePayload(payload));
  return zoneSchema.parse(extractEntity(response.data, ["zone"]));
}

export async function deleteZone(zoneId: string) {
  await http.delete(`/zones/${zoneId}`);
}

// --- Vehicles ---

function buildVehiclePayload(payload: CreateVehicleInput | UpdateVehicleInput) {
  return compactRecord({
    code: payload.code,
    is_active: payload.is_active,
    max_volume_m3: payload.max_volume_m3,
    max_weight_kg: payload.max_weight_kg,
    name: payload.name,
    notes: payload.notes,
    plate_number: payload.plate_number,
    vehicle_type: payload.vehicle_type,
  });
}

export async function listVehicles() {
  const response = await http.get("/vehicles");
  return extractCollection(response.data, ["vehicles"]).map((item) => vehicleSchema.parse(item));
}

export async function createVehicle(payload: CreateVehicleInput) {
  const response = await http.post("/vehicles", buildVehiclePayload(payload));
  return vehicleSchema.parse(extractEntity(response.data, ["vehicle"]));
}

export async function updateVehicle(vehicleId: string, payload: CreateVehicleInput | UpdateVehicleInput) {
  const response = await http.patch(`/vehicles/${vehicleId}`, buildVehiclePayload(payload));
  return vehicleSchema.parse(extractEntity(response.data, ["vehicle"]));
}

export async function deleteVehicle(vehicleId: string) {
  await http.delete(`/vehicles/${vehicleId}`);
}

// --- Routes ---

function buildRoutePayload(payload: CreateRouteInput | UpdateRouteInput) {
  return compactNullableRecord({
    code: payload.code,
    day_of_week: payload.day_of_week,
    default_driver_user_id: toOptionalNumberId(payload.default_driver_user_id) ?? null,
    default_vehicle_id: toOptionalNumberId(payload.default_vehicle_id) ?? null,
    description: payload.description,
    estimated_cost: payload.estimated_cost,
    frequency: payload.frequency,
    is_active: payload.is_active,
    name: payload.name,
    zone_id: toOptionalNumberId(payload.zone_id) ?? null,
  });
}

export async function listRoutes() {
  const response = await http.get("/routes");
  return extractCollection(response.data, ["routes"]).map((item) => routeSchema.parse(item));
}

export async function createRoute(payload: CreateRouteInput) {
  const response = await http.post("/routes", buildRoutePayload(payload));
  return routeSchema.parse(extractEntity(response.data, ["route"]));
}

export async function updateRoute(routeId: string, payload: CreateRouteInput | UpdateRouteInput) {
  const response = await http.patch(`/routes/${routeId}`, buildRoutePayload(payload));
  return routeSchema.parse(extractEntity(response.data, ["route"]));
}

export async function deleteRoute(routeId: string) {
  await http.delete(`/routes/${routeId}`);
}

// --- Branch Assignments (zones, vehicles, routes) ---

export async function getZoneBranchAssignments(zoneId: string) {
  const response = await http.get(`/zones/${zoneId}/branches`);
  return branchAssignmentsViewSchema.parse(extractEntity(response.data));
}

export async function setZoneBranchAssignments(zoneId: string, payload: SetBranchAssignmentsInput) {
  const response = await http.put(`/zones/${zoneId}/branches`, payload);
  return branchAssignmentsViewSchema.parse(extractEntity(response.data));
}

export async function getVehicleBranchAssignments(vehicleId: string) {
  const response = await http.get(`/vehicles/${vehicleId}/branches`);
  return branchAssignmentsViewSchema.parse(extractEntity(response.data));
}

export async function setVehicleBranchAssignments(vehicleId: string, payload: SetBranchAssignmentsInput) {
  const response = await http.put(`/vehicles/${vehicleId}/branches`, payload);
  return branchAssignmentsViewSchema.parse(extractEntity(response.data));
}

export async function getRouteBranchAssignments(routeId: string) {
  const response = await http.get(`/routes/${routeId}/branches`);
  return branchAssignmentsViewSchema.parse(extractEntity(response.data));
}

export async function setRouteBranchAssignments(routeId: string, payload: SetBranchAssignmentsInput) {
  const response = await http.put(`/routes/${routeId}/branches`, payload);
  return branchAssignmentsViewSchema.parse(extractEntity(response.data));
}

// --- Dispatch Orders ---

function buildDispatchOrderPayload(payload: CreateDispatchOrderInput | UpdateDispatchOrderInput) {
  return compactNullableRecord({
    branch_id: toOptionalNumberId(payload.branch_id),
    code: payload.code,
    dispatch_type: payload.dispatch_type,
    driver_user_id: toOptionalNumberId(payload.driver_user_id) ?? null,
    notes: payload.notes,
    origin_warehouse_id: toOptionalNumberId(payload.origin_warehouse_id) ?? null,
    route_id: toOptionalNumberId(payload.route_id) ?? null,
    scheduled_date: payload.scheduled_date,
    stop_sale_order_ids: payload.stop_sale_order_ids,
    vehicle_id: toOptionalNumberId(payload.vehicle_id) ?? null,
  });
}

export async function listDispatchOrders() {
  const response = await http.get("/dispatch-orders");
  return extractCollection(response.data, ["dispatch_orders"]).map((item) =>
    dispatchOrderSchema.parse(item),
  );
}

export async function getDispatchOrder(orderId: string) {
  const response = await http.get(`/dispatch-orders/${orderId}`);
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}

export async function createDispatchOrder(payload: CreateDispatchOrderInput) {
  const response = await http.post("/dispatch-orders", buildDispatchOrderPayload(payload));
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}

export async function updateDispatchOrder(orderId: string, payload: UpdateDispatchOrderInput) {
  const response = await http.patch(`/dispatch-orders/${orderId}`, buildDispatchOrderPayload(payload));
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}

export async function addDispatchStop(orderId: string, payload: CreateDispatchStopInput) {
  const response = await http.post(`/dispatch-orders/${orderId}/stops`, payload);
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}

export async function removeDispatchStop(orderId: string, stopId: string) {
  const response = await http.delete(`/dispatch-orders/${orderId}/stops/${stopId}`);
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}

export async function addDispatchExpense(orderId: string, payload: CreateDispatchExpenseInput) {
  const response = await http.post(`/dispatch-orders/${orderId}/expenses`, payload);
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}

export async function removeDispatchExpense(orderId: string, expenseId: string) {
  await http.delete(`/dispatch-orders/${orderId}/expenses/${expenseId}`);
}

export async function markDispatchDispatched(orderId: string) {
  const response = await http.post(`/dispatch-orders/${orderId}/dispatch`, undefined, withIdempotencyKey());
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}

export async function markDispatchCompleted(orderId: string) {
  const response = await http.post(`/dispatch-orders/${orderId}/complete`, undefined, withIdempotencyKey());
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}

export async function markDispatchReady(orderId: string) {
  const response = await http.post(`/dispatch-orders/${orderId}/ready`, undefined, withIdempotencyKey());
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}

export async function cancelDispatchOrder(orderId: string) {
  const response = await http.post(`/dispatch-orders/${orderId}/cancel`, undefined, withIdempotencyKey());
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}

export async function deleteDispatchOrder(orderId: string) {
  await http.delete(`/dispatch-orders/${orderId}`);
}

export async function updateDispatchStopStatus(
  orderId: string,
  stopId: string,
  payload: UpdateDispatchStopStatusInput,
) {
  const response = await http.patch(`/dispatch-orders/${orderId}/stops/${stopId}/status`, payload);
  return dispatchOrderSchema.parse(extractEntity(response.data, ["dispatch_order"]));
}
