import { http } from "@/shared/lib/http";

import {
  brandSchema,
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
  promotionSchema,
  taxProfileSchema,
  warehouseLocationSchema,
  warehouseSchema,
  warehouseStockRowSchema,
  warrantyProfileSchema,
} from "./schemas";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractCollection(data: unknown, explicitKeys: string[] = []) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  for (const key of [...explicitKeys, "items", "data", "results"]) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  return [];
}

function extractEntity(data: unknown, explicitKeys: string[] = []) {
  if (!isRecord(data) || Array.isArray(data)) {
    return data;
  }

  for (const key of [...explicitKeys, "data", "item", "result"]) {
    if (data[key] !== undefined) {
      return data[key];
    }
  }

  return data;
}

function compactRecord<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

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
    valid_from: toOptionalIsoDateTime(payload.valid_from),
    valid_to: toOptionalIsoDateTime(payload.valid_to),
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
    quantity: payload.quantity,
    reference_id: payload.reference_id,
    reference_type: payload.reference_type,
    warehouse_id: toOptionalNumberId(payload.warehouse_id),
  });
}

function buildInventoryTransferPayload(payload: CreateInventoryTransferInput) {
  return compactRecord({
    destination_warehouse_id: toOptionalNumberId(payload.destination_warehouse_id),
    notes: payload.notes,
    origin_warehouse_id: toOptionalNumberId(payload.origin_warehouse_id),
    product_id: toOptionalNumberId(payload.product_id),
    quantity: payload.quantity,
    reference_id: payload.reference_id,
    reference_type: payload.reference_type,
    unit_cost: payload.unit_cost,
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

export async function listInventoryMovements() {
  const response = await http.get("/inventory-movements");
  return extractCollection(response.data, ["inventory_movements", "inventoryMovements"]).map((item) =>
    inventoryMovementRowSchema.parse(item),
  );
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
  return inventoryTransferResponseSchema.parse(extractEntity(response.data, ["movement"]));
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

// --- Paginated API functions ---

export type PaginatedQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export async function listProductsPaginated(
  params: PaginatedQueryParams,
): Promise<PaginatedResponse<ReturnType<typeof productSchema.parse>>> {
  const response = await http.get("/products", { params });
  const raw = response.data;
  return {
    data: extractCollection(raw, ["products"]).map((item) => productSchema.parse(item)),
    total: raw?.total ?? 0,
    page: raw?.page ?? 1,
    limit: raw?.limit ?? 20,
    total_pages: raw?.total_pages ?? 1,
  };
}

export async function listInventoryLotsPaginated(
  params: PaginatedQueryParams,
): Promise<PaginatedResponse<ReturnType<typeof inventoryLotSchema.parse>>> {
  const response = await http.get("/inventory-lots", { params });
  const raw = response.data;
  return {
    data: extractCollection(raw, ["inventory_lots", "inventoryLots"]).map((item) =>
      inventoryLotSchema.parse(item),
    ),
    total: raw?.total ?? 0,
    page: raw?.page ?? 1,
    limit: raw?.limit ?? 20,
    total_pages: raw?.total_pages ?? 1,
  };
}

export async function listInventoryMovementsPaginated(
  params: PaginatedQueryParams,
): Promise<PaginatedResponse<ReturnType<typeof inventoryMovementRowSchema.parse>>> {
  const response = await http.get("/inventory-movements", { params });
  const raw = response.data;
  return {
    data: extractCollection(raw, ["inventory_movements", "inventoryMovements"]).map((item) =>
      inventoryMovementRowSchema.parse(item),
    ),
    total: raw?.total ?? 0,
    page: raw?.page ?? 1,
    limit: raw?.limit ?? 20,
    total_pages: raw?.total_pages ?? 1,
  };
}
