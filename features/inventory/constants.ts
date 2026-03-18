export const productTypeValues = ["product", "service"] as const;
export const priceListKindValues = ["retail", "wholesale", "credit", "special"] as const;
export const promotionTypeValues = [
  "percentage",
  "fixed_amount",
  "buy_x_get_y",
  "price_override",
] as const;
export const taxTypeValues = ["iva", "exento", "no_sujeto", "specific_tax"] as const;
export const taxProfileItemKindValues = ["goods", "service"] as const;
export const warrantyDurationUnitValues = ["days", "months", "years"] as const;
export const warehousePurposeValues = [
  "saleable",
  "reserve",
  "damaged",
  "returns",
  "transit",
  "production",
  "general_storage",
] as const;
export const legacyInventoryMovementTypeValues = [
  "purchase_in",
  "sale_out",
  "adjustment_in",
  "adjustment_out",
  "transfer_in",
  "transfer_out",
  "return_in",
  "return_out",
] as const;
export const inventoryAdjustmentTypeValues = ["adjustment_in", "adjustment_out"] as const;
export const ledgerInventoryMovementHeaderTypeValues = [
  "purchase_receipt",
  "sales_dispatch",
  "stock_adjustment",
  "transfer",
  "manual_correction",
  "reservation",
  "release",
  "return_in",
  "return_out",
  "purchase_expected",
  "sales_allocated",
] as const;
export const inventoryMovementStatusValues = [
  "draft",
  "posted",
  "cancelled",
  "in_transit",
  "received",
  "partially_received",
] as const;

export const serialStatusValues = [
  "available",
  "reserved",
  "sold",
  "defective",
  "returned",
] as const;
export const serialEventTypeValues = [
  "received",
  "transferred",
  "sold",
  "returned",
  "repaired",
  "status_change",
] as const;

export const serialStatusOptions = [
  { label: "Available", value: "available" },
  { label: "Reserved", value: "reserved" },
  { label: "Sold", value: "sold" },
  { label: "Defective", value: "defective" },
  { label: "Returned", value: "returned" },
] as const;

export const inventoryViewPermissions = [
  "brands.view",
  "measurement_units.view",
  "categories.view",
  "tax_profiles.view",
  "warranty_profiles.view",
  "products.view",
  "price_lists.view",
  "product_prices.view",
  "promotions.view",
  "warehouses.view",
  "warehouse_locations.view",
  "warehouse_stock.view",
  "inventory_lots.view",
  "inventory_movements.view",
] as const;

export const taxProfileItemKindOptions = [
  { label: "Goods", value: "goods" },
  { label: "Service", value: "service" },
] as const;

export const productTypeOptions = [
  { label: "Product", value: "product" },
  { label: "Service", value: "service" },
] as const;

export const priceListKindOptions = [
  { label: "Retail", value: "retail" },
  { label: "Wholesale", value: "wholesale" },
  { label: "Credit", value: "credit" },
  { label: "Special", value: "special" },
] as const;

export const taxTypeOptions = [
  { label: "IVA", value: "iva" },
  { label: "Exempt", value: "exento" },
  { label: "Not subject", value: "no_sujeto" },
  { label: "Specific tax", value: "specific_tax" },
] as const;

export const warrantyDurationUnitOptions = [
  { label: "Days", value: "days" },
  { label: "Months", value: "months" },
  { label: "Years", value: "years" },
] as const;
