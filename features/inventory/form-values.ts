import type {
  Brand,
  CreateBrandInput,
  CreateInventoryAdjustmentInput,
  CreateInventoryLotInput,
  CreateInventoryTransferInput,
  CreateMeasurementUnitInput,
  CreatePriceListInput,
  CreateProductCategoryInput,
  CreateProductInput,
  CreateProductPriceInput,
  CreateProductVariantInput,
  CreatePromotionInput,
  CreateTaxProfileInput,
  CreateWarehouseInput,
  CreateWarehouseLocationInput,
  CreateWarrantyProfileInput,
  InventoryLot,
  PriceList,
  Product,
  ProductCategory,
  ProductPrice,
  ProductVariant,
  Promotion,
  TaxProfile,
  Warehouse,
  WarehouseLocation,
  WarrantyProfile,
  MeasurementUnit,
} from "./types";

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const emptyBrandFormValues: CreateBrandInput = {
  code: "",
  description: "",
  is_active: true,
  name: "",
};

export function getBrandFormValues(brand: Brand): CreateBrandInput {
  return {
    code: brand.code ?? "",
    description: brand.description ?? "",
    is_active: brand.is_active,
    name: brand.name,
  };
}

export const emptyMeasurementUnitFormValues: CreateMeasurementUnitInput = {
  code: "",
  is_active: true,
  name: "",
  symbol: "",
};

export function getMeasurementUnitFormValues(
  measurementUnit: MeasurementUnit,
): CreateMeasurementUnitInput {
  return {
    code: measurementUnit.code ?? "",
    is_active: measurementUnit.is_active,
    name: measurementUnit.name,
    symbol: measurementUnit.symbol,
  };
}

export const emptyProductCategoryFormValues: CreateProductCategoryInput = {
  code: "",
  description: "",
  is_active: true,
  name: "",
  parent_id: "",
};

export function getProductCategoryFormValues(
  category: ProductCategory,
): CreateProductCategoryInput {
  return {
    code: category.code ?? "",
    description: category.description ?? "",
    is_active: category.is_active,
    name: category.name,
    parent_id: category.parent_id ?? "",
  };
}

export const emptyTaxProfileFormValues: CreateTaxProfileInput = {
  allows_exoneration: false,
  cabys_code: "",
  code: "",
  description: "",
  is_active: true,
  item_kind: "goods",
  iva_rate: undefined,
  iva_rate_code: "",
  name: "",
  requires_cabys: false,
  specific_tax_name: "",
  specific_tax_rate: undefined,
  tax_type: "iva",
};

export function getTaxProfileFormValues(taxProfile: TaxProfile): CreateTaxProfileInput {
  return {
    allows_exoneration: taxProfile.allows_exoneration,
    cabys_code: taxProfile.cabys_code ?? "",
    code: taxProfile.code ?? "",
    description: taxProfile.description ?? "",
    is_active: taxProfile.is_active,
    item_kind: taxProfile.item_kind ?? "goods",
    iva_rate: taxProfile.iva_rate,
    iva_rate_code: taxProfile.iva_rate_code ?? "",
    name: taxProfile.name,
    requires_cabys: taxProfile.requires_cabys,
    specific_tax_name: taxProfile.specific_tax_name ?? "",
    specific_tax_rate: taxProfile.specific_tax_rate,
    tax_type: taxProfile.tax_type ?? "iva",
  };
}

export const emptyWarrantyProfileFormValues: CreateWarrantyProfileInput = {
  code: "",
  coverage_notes: "",
  duration_unit: "months",
  duration_value: 1,
  is_active: true,
  name: "",
};

export function getWarrantyProfileFormValues(
  warrantyProfile: WarrantyProfile,
): CreateWarrantyProfileInput {
  return {
    code: warrantyProfile.code ?? "",
    coverage_notes: warrantyProfile.coverage_notes ?? "",
    duration_unit: warrantyProfile.duration_unit ?? "months",
    duration_value: warrantyProfile.duration_value ?? 1,
    is_active: warrantyProfile.is_active,
    name: warrantyProfile.name,
  };
}

export const emptyProductFormValues: CreateProductInput = {
  allow_negative_stock: false,
  barcode: "",
  brand_id: "",
  category_id: "",
  code: "",
  description: "",
  has_variants: false,
  has_warranty: false,
  is_active: true,
  name: "",
  sale_unit_id: "",
  sku: "",
  stock_unit_id: "",
  tax_profile_id: "",
  track_expiration: false,
  track_inventory: false,
  track_lots: false,
  type: "product",
  warranty_profile_id: "",
};

export function getProductFormValues(product: Product): CreateProductInput {
  return {
    allow_negative_stock: product.allow_negative_stock,
    barcode: product.barcode ?? "",
    brand_id: product.brand?.id ?? "",
    category_id: product.category?.id ?? "",
    code: product.code ?? "",
    description: product.description ?? "",
    has_variants: product.has_variants,
    has_warranty: product.has_warranty,
    is_active: product.is_active,
    name: product.name,
    sale_unit_id: product.sale_unit?.id ?? "",
    sku: product.sku ?? "",
    stock_unit_id: product.stock_unit?.id ?? "",
    tax_profile_id: product.tax_profile?.id ?? "",
    track_expiration: product.track_expiration,
    track_inventory: product.track_inventory,
    track_lots: product.track_lots,
    type: product.type ?? "product",
    warranty_profile_id: product.warranty_profile?.id ?? "",
  };
}

export const emptyPriceListFormValues: CreatePriceListInput = {
  code: "",
  currency: "CRC",
  is_active: true,
  is_default: false,
  kind: "retail",
  name: "",
};

export function getPriceListFormValues(priceList: PriceList): CreatePriceListInput {
  return {
    code: priceList.code ?? "",
    currency: priceList.currency ?? "CRC",
    is_active: priceList.is_active,
    is_default: priceList.is_default,
    kind: priceList.kind ?? "retail",
    name: priceList.name,
  };
}

export const emptyProductPriceFormValues: CreateProductPriceInput = {
  is_active: true,
  min_quantity: undefined,
  price: 0,
  price_list_id: "",
  valid_from: "",
  valid_to: "",
};

export function getProductPriceFormValues(productPrice: ProductPrice): CreateProductPriceInput {
  return {
    is_active: productPrice.is_active,
    min_quantity: productPrice.min_quantity,
    price: productPrice.price ?? 0,
    price_list_id: productPrice.price_list.id,
    valid_from: toDateTimeLocalValue(productPrice.valid_from),
    valid_to: toDateTimeLocalValue(productPrice.valid_to),
  };
}

export const emptyPromotionFormValues: CreatePromotionInput = {
  code: "",
  is_active: true,
  items: [],
  name: "",
  type: "percentage",
  valid_from: "",
  valid_to: "",
};

export function getPromotionFormValues(promotion: Promotion): CreatePromotionInput {
  return {
    code: promotion.code ?? "",
    is_active: promotion.is_active,
    items: promotion.items.map((item) => ({
      bonus_quantity: item.bonus_quantity ?? undefined,
      discount_value: item.discount_value ?? undefined,
      min_quantity: item.min_quantity ?? undefined,
      override_price: item.override_price ?? undefined,
      product_id: item.product.id,
    })),
    name: promotion.name,
    type: promotion.type ?? "percentage",
    valid_from: toDateTimeLocalValue(promotion.valid_from),
    valid_to: toDateTimeLocalValue(promotion.valid_to),
  };
}

export const emptyWarehouseFormValues: CreateWarehouseInput = {
  branch_id: "",
  code: "",
  description: "",
  is_active: true,
  is_default: false,
  name: "",
  uses_locations: false,
};

export function getWarehouseFormValues(warehouse: Warehouse): CreateWarehouseInput {
  return {
    branch_id: warehouse.branch_id ?? "",
    code: warehouse.code ?? "",
    description: warehouse.description ?? "",
    is_active: warehouse.is_active,
    is_default: warehouse.is_default,
    name: warehouse.name,
    uses_locations: warehouse.uses_locations,
  };
}

export const emptyWarehouseLocationFormValues: CreateWarehouseLocationInput = {
  aisle: "",
  barcode: "",
  code: "",
  description: "",
  is_active: true,
  is_dispatch_area: false,
  is_picking_area: false,
  is_receiving_area: false,
  level: "",
  name: "",
  position: "",
  rack: "",
  zone: "",
};

export function getWarehouseLocationFormValues(
  location: WarehouseLocation,
): CreateWarehouseLocationInput {
  return {
    aisle: location.aisle ?? "",
    barcode: location.barcode ?? "",
    code: location.code ?? "",
    description: location.description ?? "",
    is_active: location.is_active,
    is_dispatch_area: location.is_dispatch_area,
    is_picking_area: location.is_picking_area,
    is_receiving_area: location.is_receiving_area,
    level: location.level ?? "",
    name: location.name,
    position: location.position ?? "",
    rack: location.rack ?? "",
    zone: location.zone ?? "",
  };
}

export const emptyInventoryLotFormValues: CreateInventoryLotInput = {
  code: "",
  expiration_date: "",
  initial_quantity: 0,
  is_active: true,
  location_id: "",
  lot_number: "",
  manufacturing_date: "",
  product_id: "",
  received_at: "",
  supplier_contact_id: "",
  unit_cost: undefined,
  warehouse_id: "",
};

export function getInventoryLotFormValues(lot: InventoryLot): CreateInventoryLotInput {
  return {
    code: lot.code ?? "",
    expiration_date: toDateInputValue(lot.expiration_date),
    initial_quantity: lot.initial_quantity ?? 0,
    is_active: lot.is_active,
    location_id: lot.location?.id ?? "",
    lot_number: lot.lot_number,
    manufacturing_date: toDateInputValue(lot.manufacturing_date),
    product_id: lot.product.id,
    received_at: toDateTimeLocalValue(lot.received_at),
    supplier_contact_id: lot.supplier_contact?.id ?? "",
    unit_cost: lot.unit_cost ?? undefined,
    warehouse_id: lot.warehouse.id,
  };
}

export const emptyInventoryAdjustmentFormValues: CreateInventoryAdjustmentInput = {
  inventory_lot_id: "",
  location_id: "",
  movement_type: "adjustment_in",
  notes: "",
  product_id: "",
  quantity: 1,
  reference_id: undefined,
  reference_type: "",
  warehouse_id: "",
};

export const emptyInventoryTransferFormValues: CreateInventoryTransferInput = {
  destination_warehouse_id: "",
  notes: "",
  origin_warehouse_id: "",
  product_id: "",
  quantity: 1,
  reference_id: undefined,
  reference_type: "",
  unit_cost: undefined,
};

export const emptyProductVariantFormValues: CreateProductVariantInput = {
  allow_negative_stock: false,
  barcode: "",
  default_warranty_profile_id: "",
  fiscal_profile_id: "",
  is_active: true,
  sale_unit_measure_id: "",
  sku: "",
  stock_unit_measure_id: "",
  track_expiration: false,
  track_inventory: true,
  track_lots: false,
  track_serials: false,
  variant_name: "",
};

export function getProductVariantFormValues(
  variant: ProductVariant,
): CreateProductVariantInput {
  return {
    allow_negative_stock: variant.allow_negative_stock,
    barcode: variant.barcode ?? "",
    default_warranty_profile_id: variant.default_warranty_profile?.id ?? "",
    fiscal_profile_id: variant.fiscal_profile?.id ?? "",
    is_active: variant.is_active,
    sale_unit_measure_id: variant.sale_unit_measure?.id ?? "",
    sku: variant.sku,
    stock_unit_measure_id: variant.stock_unit_measure?.id ?? "",
    track_expiration: variant.track_expiration,
    track_inventory: variant.track_inventory,
    track_lots: variant.track_lots,
    track_serials: variant.track_serials,
    variant_name: variant.variant_name ?? "",
  };
}
