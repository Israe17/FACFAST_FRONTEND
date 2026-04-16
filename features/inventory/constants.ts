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
  "dispatch_cancelled",
  "dispatch_return",
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

export const inventoryCatalogViewPermissions = [
  "brands.view",
  "measurement_units.view",
  "categories.view",
  "tax_profiles.view",
  "warranty_profiles.view",
] as const;

export const inventoryProductViewPermissions = [
  "products.view",
  "product_variants.view",
  "variant_attributes.view",
  "product_serials.view",
] as const;

export const inventoryPricingViewPermissions = [
  "price_lists.view",
  "product_prices.view",
  "promotions.view",
] as const;

export const inventoryWarehouseViewPermissions = [
  "warehouses.view",
  "warehouse_locations.view",
] as const;

export const inventoryOperationsViewPermissions = [
  "warehouse_stock.view",
  "inventory_lots.view",
  "inventory_movements.view",
] as const;

export const inventoryViewPermissions = [
  ...inventoryCatalogViewPermissions,
  ...inventoryProductViewPermissions,
  ...inventoryPricingViewPermissions,
  ...inventoryWarehouseViewPermissions,
  ...inventoryOperationsViewPermissions,
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

export const dispatchTypeValues = ["individual", "consolidated"] as const;
export const dispatchOrderStatusValues = ["draft", "ready", "dispatched", "in_transit", "completed", "cancelled"] as const;
export const dispatchStopStatusValues = ["pending", "in_transit", "delivered", "failed", "partial", "skipped"] as const;
export const dispatchExpenseTypeValues = ["fuel", "tolls", "per_diem", "driver_pay", "helper", "outsource", "maintenance", "other"] as const;

// --- Dispatch UI maps (shared across dispatch components) ---

import type { FrontendTranslationKey } from "@/shared/i18n/translations";

export const dispatchStatusColorMap: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  ready: "bg-blue-100 text-blue-800",
  dispatched: "bg-indigo-100 text-indigo-800",
  in_transit: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const dispatchStatusTranslationMap: Record<string, FrontendTranslationKey> = {
  draft: "inventory.dispatch.status_draft",
  ready: "inventory.dispatch.status_ready",
  dispatched: "inventory.dispatch.status_dispatched",
  in_transit: "inventory.dispatch.status_in_transit",
  completed: "inventory.dispatch.status_completed",
  cancelled: "inventory.dispatch.status_cancelled",
};

export const dispatchBorderColorMap: Record<string, string> = {
  draft: "border-l-yellow-400",
  ready: "border-l-blue-400",
  dispatched: "border-l-indigo-400",
  in_transit: "border-l-orange-400",
  completed: "border-l-green-400",
  cancelled: "border-l-red-400",
};

export const dispatchProgressColorMap: Record<string, string> = {
  draft: "bg-yellow-400",
  ready: "bg-blue-400",
  dispatched: "bg-indigo-400",
  in_transit: "bg-orange-400",
  completed: "bg-green-400",
  cancelled: "bg-red-400",
};

export const dispatchStopStatusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  partial: "bg-orange-100 text-orange-800",
  skipped: "bg-gray-100 text-gray-800",
};

export const dispatchStopStatusTranslationMap: Record<string, FrontendTranslationKey> = {
  pending: "inventory.dispatch.stop_pending",
  in_transit: "inventory.dispatch.stop_in_transit",
  delivered: "inventory.dispatch.stop_delivered",
  failed: "inventory.dispatch.stop_failed",
  partial: "inventory.dispatch.stop_partial",
  skipped: "inventory.dispatch.stop_skipped",
};
