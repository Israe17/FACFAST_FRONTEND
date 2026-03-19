import { z } from "zod/v4";

import {
  currencyCodePattern,
  digitsPattern,
  optionalTrimmedString,
  positiveIntegerPattern,
  requiredTrimmedString,
} from "@/shared/lib/validation";

import {
  inventoryAdjustmentTypeValues,
  inventoryMovementStatusValues,
  ledgerInventoryMovementHeaderTypeValues,
  legacyInventoryMovementTypeValues,
  priceListKindValues,
  productTypeValues,
  promotionTypeValues,
  taxProfileItemKindValues,
  taxTypeValues,
  warehousePurposeValues,
  warrantyDurationUnitValues,
} from "./constants";

const idSchema = z.union([z.string(), z.number()]).transform(String);
const nullableIdSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => (value == null ? null : String(value)));

const optionalTextSchema = optionalTrimmedString(z.string());
const optionalDateTimeSchema = optionalTrimmedString(z.string());
const optionalDateSchema = optionalTrimmedString(z.string());

function makeOptionalCodeSchema(prefix: string) {
  return optionalTrimmedString(
    z.string().regex(new RegExp(`^${prefix}-\\d{4,}$`), `Use a code like ${prefix}-0001.`),
  );
}

function makeOptionalIdSchema(message: string) {
  return z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.string().regex(positiveIntegerPattern, message).optional());
}

function optionalNumberSchema(schema: z.ZodTypeAny) {
  return z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return value;
  }, schema.optional());
}

function createDateRangeRefiner(
  startKey: string,
  endKey: string,
  message: string,
) {
  return (values: Record<string, unknown>, ctx: z.RefinementCtx) => {
    const start = typeof values[startKey] === "string" ? values[startKey] : undefined;
    const end = typeof values[endKey] === "string" ? values[endKey] : undefined;

    if (!start || !end) {
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return;
    }

    if (endDate < startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: [endKey],
      });
    }
  };
}

const taxProfileItemKindSchema = z.enum(taxProfileItemKindValues);
const taxTypeSchema = z.enum(taxTypeValues);
const warrantyDurationUnitSchema = z.enum(warrantyDurationUnitValues);
const productTypeSchema = z.enum(productTypeValues);
const priceListKindSchema = z.enum(priceListKindValues);
const promotionTypeSchema = z.enum(promotionTypeValues);
const warehousePurposeSchema = z.enum(warehousePurposeValues);
const legacyInventoryMovementTypeSchema = z.enum(legacyInventoryMovementTypeValues);
const inventoryAdjustmentTypeSchema = z.enum(inventoryAdjustmentTypeValues);
const ledgerInventoryMovementHeaderTypeSchema = z.enum(ledgerInventoryMovementHeaderTypeValues);
const inventoryMovementStatusSchema = z.enum(inventoryMovementStatusValues);

const inventoryEntitySummarySchema = z
  .object({
    code: z.string().optional().catch(undefined),
    id: idSchema,
    name: z.string().catch("Item"),
  })
  .passthrough();

const inventoryEntityWithTypeSummarySchema = inventoryEntitySummarySchema.extend({
  type: productTypeSchema.optional().catch(undefined),
});

const measurementUnitSummarySchema = inventoryEntitySummarySchema.extend({
  symbol: z.string().optional().catch(undefined),
});

const taxProfileSummarySchema = inventoryEntitySummarySchema.extend({
  cabys_code: z.string().optional().catch(undefined),
  item_kind: taxProfileItemKindSchema.optional().catch(undefined),
  tax_type: taxTypeSchema.optional().catch(undefined),
});

const priceListSummarySchema = inventoryEntitySummarySchema.extend({
  currency: z.string().optional().catch(undefined),
  kind: priceListKindSchema.optional().catch(undefined),
});

const branchSummarySchema = z
  .object({
    business_name: z.string().optional().catch(undefined),
    branch_number: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    id: idSchema,
    name: z.string().optional().catch(undefined),
  })
  .passthrough();

const warehouseSummarySchema = inventoryEntitySummarySchema.extend({
  purpose: warehousePurposeSchema.optional().catch(undefined),
});

const warehouseLocationSummarySchema = inventoryEntitySummarySchema.extend({
  warehouse_id: idSchema.optional().catch(undefined),
});

const productVariantSummarySchema = z
  .object({
    barcode: z.string().nullable().optional().catch(undefined),
    id: idSchema,
    is_default: z.boolean().optional().default(false),
    sku: z.string().nullable().optional().catch(undefined),
    variant_name: z.string().optional().catch(undefined),
  })
  .passthrough();

const userSummarySchema = z
  .object({
    code: z.string().optional().catch(undefined),
    email: z.string().optional().catch(undefined),
    id: idSchema,
    name: z.string().catch("User"),
  })
  .passthrough();

const supplierContactSummarySchema = inventoryEntitySummarySchema.extend({
  type: z.string().optional().catch(undefined),
});

const inventoryLotSummarySchema = z
  .object({
    code: z.string().optional().catch(undefined),
    id: idSchema,
    lot_number: z.string().optional().catch(undefined),
    name: z.string().optional().catch(undefined),
  })
  .passthrough();

export const brandSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    description: z.string().nullable().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    name: z.string().catch("Brand"),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const measurementUnitSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    name: z.string().catch("Measurement unit"),
    symbol: z.string().catch(""),
    updated_at: z.string().optional(),
  })
  .passthrough();

const productCategoryBaseSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    description: z.string().nullable().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    level: z.coerce.number().optional().catch(undefined),
    name: z.string().catch("Category"),
    parent_id: nullableIdSchema.default(null),
    path: z.string().optional().catch(undefined),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const productCategorySchema = productCategoryBaseSchema;

type ProductCategoryTreeSchema = z.ZodType<
  z.infer<typeof productCategoryBaseSchema> & { children: unknown[] }
>;

export const productCategoryTreeSchema: ProductCategoryTreeSchema =
  productCategoryBaseSchema.extend({
    children: z.array(z.lazy(() => productCategoryTreeSchema)).optional().default([]),
  });

export const taxProfileSchema = z
  .object({
    allows_exoneration: z.boolean().optional().default(false),
    business_id: idSchema.optional().catch(undefined),
    cabys_code: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    description: z.string().nullable().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    item_kind: taxProfileItemKindSchema.optional().catch(undefined),
    iva_rate: z.coerce.number().optional().catch(undefined),
    iva_rate_code: z.string().nullable().optional().catch(undefined),
    name: z.string().catch("Tax profile"),
    requires_cabys: z.boolean().optional().default(false),
    specific_tax_name: z.string().nullable().optional().catch(undefined),
    specific_tax_rate: z.coerce.number().optional().catch(undefined),
    tax_type: taxTypeSchema.optional().catch(undefined),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const warrantyProfileSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    coverage_notes: z.string().nullable().optional().catch(undefined),
    created_at: z.string().optional(),
    duration_unit: warrantyDurationUnitSchema.optional().catch(undefined),
    duration_value: z.coerce.number().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    name: z.string().catch("Warranty profile"),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const productSchema = z
  .object({
    allow_negative_stock: z.boolean().optional().default(false),
    barcode: z.string().nullable().optional().catch(undefined),
    brand: inventoryEntitySummarySchema.nullable().optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    category: inventoryEntitySummarySchema.nullable().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    description: z.string().nullable().optional().catch(undefined),
    has_variants: z.boolean().optional().default(false),
    has_warranty: z.boolean().optional().default(false),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    name: z.string().catch("Product"),
    sale_unit: measurementUnitSummarySchema.nullable().optional().catch(undefined),
    sku: z.string().nullable().optional().catch(undefined),
    stock_unit: measurementUnitSummarySchema.nullable().optional().catch(undefined),
    tax_profile: taxProfileSummarySchema.nullable().optional().catch(undefined),
    track_expiration: z.boolean().optional().default(false),
    track_inventory: z.boolean().optional().default(false),
    track_lots: z.boolean().optional().default(false),
    type: productTypeSchema.optional().catch(undefined),
    updated_at: z.string().optional(),
    warranty_profile: inventoryEntitySummarySchema.nullable().optional().catch(undefined),
  })
  .passthrough();

export const priceListSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    currency: z.string().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    is_default: z.boolean().optional().default(false),
    kind: priceListKindSchema.optional().catch(undefined),
    name: z.string().catch("Price list"),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const productPriceSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    created_at: z.string().optional(),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    min_quantity: z.coerce.number().optional().catch(undefined),
    price: z.coerce.number().optional().catch(undefined),
    price_list: priceListSummarySchema,
    product_id: idSchema.optional().catch(undefined),
    product_variant: productVariantSummarySchema.nullable().optional().catch(undefined),
    updated_at: z.string().optional(),
    valid_from: z.string().nullable().optional().catch(undefined),
    valid_to: z.string().nullable().optional().catch(undefined),
  })
  .passthrough();

export const promotionItemSchema = z
  .object({
    bonus_quantity: z.coerce.number().nullable().optional().catch(undefined),
    discount_value: z.coerce.number().nullable().optional().catch(undefined),
    id: idSchema.optional().catch(undefined),
    min_quantity: z.coerce.number().nullable().optional().catch(undefined),
    override_price: z.coerce.number().nullable().optional().catch(undefined),
    product: inventoryEntitySummarySchema,
  })
  .passthrough();

export const promotionSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    items: z.array(promotionItemSchema).optional().default([]),
    name: z.string().catch("Promotion"),
    type: promotionTypeSchema.optional().catch(undefined),
    updated_at: z.string().optional(),
    valid_from: z.string().optional().catch(undefined),
    valid_to: z.string().optional().catch(undefined),
  })
  .passthrough();

export const warehouseSchema = z
  .object({
    branch_id: idSchema.optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    description: z.string().nullable().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    is_default: z.boolean().optional().default(false),
    name: z.string().catch("Warehouse"),
    purpose: warehousePurposeSchema.optional().catch(undefined),
    updated_at: z.string().optional(),
    uses_locations: z.boolean().optional().default(false),
  })
  .passthrough();

export const warehouseLocationSchema = z
  .object({
    aisle: z.string().nullable().optional().catch(undefined),
    barcode: z.string().nullable().optional().catch(undefined),
    branch_id: idSchema.optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    description: z.string().nullable().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    is_dispatch_area: z.boolean().optional().default(false),
    is_picking_area: z.boolean().optional().default(false),
    is_receiving_area: z.boolean().optional().default(false),
    level: z.string().nullable().optional().catch(undefined),
    name: z.string().catch("Warehouse location"),
    position: z.string().nullable().optional().catch(undefined),
    rack: z.string().nullable().optional().catch(undefined),
    updated_at: z.string().optional(),
    warehouse_id: idSchema.optional().catch(undefined),
    zone: z.string().nullable().optional().catch(undefined),
  })
  .passthrough();

export const warehouseStockRowSchema = z
  .object({
    available_quantity: z.coerce.number().optional().catch(undefined),
    branch_id: idSchema.optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    id: idSchema,
    incoming_quantity: z.coerce.number().optional().catch(undefined),
    max_stock: z.coerce.number().nullable().optional().catch(undefined),
    min_stock: z.coerce.number().nullable().optional().catch(undefined),
    outgoing_quantity: z.coerce.number().optional().catch(undefined),
    product: inventoryEntityWithTypeSummarySchema,
    product_variant: productVariantSummarySchema,
    projected_quantity: z.coerce.number().optional().catch(undefined),
    quantity: z.coerce.number().optional().catch(undefined),
    reserved_quantity: z.coerce.number().optional().catch(undefined),
    updated_at: z.string().optional(),
    warehouse: warehouseSummarySchema,
  })
  .passthrough();

export const inventoryLotSchema = z
  .object({
    branch_id: idSchema.optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    current_quantity: z.coerce.number().optional().catch(undefined),
    expiration_date: z.string().nullable().optional().catch(undefined),
    id: idSchema,
    initial_quantity: z.coerce.number().optional().catch(undefined),
    is_active: z.boolean().optional().default(true),
    location: warehouseLocationSummarySchema.nullable().optional().catch(undefined),
    lot_number: z.string().catch(""),
    manufacturing_date: z.string().nullable().optional().catch(undefined),
    product: inventoryEntitySummarySchema,
    product_variant: productVariantSummarySchema.nullable().optional().catch(undefined),
    received_at: z.string().nullable().optional().catch(undefined),
    supplier_contact: supplierContactSummarySchema.nullable().optional().catch(undefined),
    unit_cost: z.coerce.number().nullable().optional().catch(undefined),
    updated_at: z.string().optional(),
    warehouse: warehouseSummarySchema,
  })
  .passthrough();

export const inventoryMovementRowSchema = z
  .object({
    branch: branchSummarySchema.nullable().optional().catch(undefined),
    branch_id: idSchema.optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    created_by: userSummarySchema.nullable().optional().catch(undefined),
    header_id: idSchema.optional().catch(undefined),
    id: idSchema,
    incoming_delta: z.coerce.number().optional().catch(undefined),
    inventory_lot: inventoryLotSummarySchema.nullable().optional().catch(undefined),
    line_no: z.coerce.number().optional().catch(undefined),
    linked_line_id: nullableIdSchema.default(null),
    movement_type: ledgerInventoryMovementHeaderTypeSchema.optional().catch(undefined),
    new_quantity: z.coerce.number().nullable().optional().catch(undefined),
    notes: z.string().nullable().optional().catch(undefined),
    occurred_at: z.string().optional(),
    on_hand_delta: z.coerce.number().optional().catch(undefined),
    outgoing_delta: z.coerce.number().optional().catch(undefined),
    previous_quantity: z.coerce.number().nullable().optional().catch(undefined),
    product: inventoryEntityWithTypeSummarySchema,
    product_variant: productVariantSummarySchema.nullable().optional().catch(undefined),
    quantity: z.coerce.number().optional().catch(undefined),
    reference_id: nullableIdSchema.default(null),
    reference_number: z.string().nullable().optional().catch(undefined),
    reference_type: z.string().nullable().optional().catch(undefined),
    reserved_delta: z.coerce.number().optional().catch(undefined),
    status: inventoryMovementStatusSchema.optional().catch(undefined),
    total_cost: z.coerce.number().nullable().optional().catch(undefined),
    unit_cost: z.coerce.number().nullable().optional().catch(undefined),
    warehouse: warehouseSummarySchema,
  })
  .passthrough();

export const inventoryAdjustmentResponseSchema = z
  .object({
    branch_id: idSchema.optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    created_by: userSummarySchema.nullable().optional().catch(undefined),
    id: idSchema,
    inventory_lot: inventoryLotSummarySchema.nullable().optional().catch(undefined),
    location: warehouseLocationSummarySchema.nullable().optional().catch(undefined),
    movement_type: legacyInventoryMovementTypeSchema.optional().catch(undefined),
    new_quantity: z.coerce.number().nullable().optional().catch(undefined),
    notes: z.string().nullable().optional().catch(undefined),
    previous_quantity: z.coerce.number().nullable().optional().catch(undefined),
    product: inventoryEntitySummarySchema,
    quantity: z.coerce.number().optional().catch(undefined),
    reference_id: nullableIdSchema.default(null),
    reference_type: z.string().nullable().optional().catch(undefined),
    warehouse: warehouseSummarySchema,
  })
  .passthrough();

const inventoryTransferLineSchema = z
  .object({
    header_id: idSchema.optional().catch(undefined),
    id: idSchema,
    line_no: z.coerce.number().optional().catch(undefined),
    linked_line_id: nullableIdSchema.default(null),
    on_hand_delta: z.coerce.number().optional().catch(undefined),
    product_variant_id: idSchema.optional().catch(undefined),
    quantity: z.coerce.number().optional().catch(undefined),
    total_cost: z.coerce.number().nullable().optional().catch(undefined),
    unit_cost: z.coerce.number().nullable().optional().catch(undefined),
    warehouse_id: idSchema.optional().catch(undefined),
  })
  .passthrough();

export const inventoryTransferResponseSchema = z
  .object({
    branch_id: idSchema.optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    id: idSchema,
    legacy_movement_ids: z.array(idSchema).optional().default([]),
    lines: z.array(inventoryTransferLineSchema).optional().default([]),
    movement_type: ledgerInventoryMovementHeaderTypeSchema.optional().catch(undefined),
    notes: z.string().nullable().optional().catch(undefined),
    occurred_at: z.string().optional(),
    status: inventoryMovementStatusSchema.optional().catch(undefined),
  })
  .passthrough();

const inventoryCancellationLineSchema = z
  .object({
    branch_id: idSchema.optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    header_id: idSchema.optional().catch(undefined),
    id: idSchema,
    line_no: z.coerce.number().optional().catch(undefined),
    linked_line_id: nullableIdSchema.default(null),
    movement_type: ledgerInventoryMovementHeaderTypeSchema.optional().catch(undefined),
    on_hand_delta: z.coerce.number().optional().catch(undefined),
    quantity: z.coerce.number().optional().catch(undefined),
    status: inventoryMovementStatusSchema.optional().catch(undefined),
  })
  .passthrough();

export const inventoryMovementCancellationResponseSchema = z
  .object({
    cancelled_movement: z
      .object({
        code: z.string().optional().catch(undefined),
        id: idSchema,
        status: inventoryMovementStatusSchema.optional().catch(undefined),
      })
      .passthrough(),
    compensating_movement: z
      .object({
        branch_id: idSchema.optional().catch(undefined),
        business_id: idSchema.optional().catch(undefined),
        code: z.string().optional().catch(undefined),
        id: idSchema,
        lines: z.array(inventoryCancellationLineSchema).optional().default([]),
        movement_type: ledgerInventoryMovementHeaderTypeSchema.optional().catch(undefined),
        notes: z.string().nullable().optional().catch(undefined),
        occurred_at: z.string().optional(),
        reference_id: nullableIdSchema.default(null),
        reference_number: z.string().nullable().optional().catch(undefined),
        reference_type: z.string().nullable().optional().catch(undefined),
        status: inventoryMovementStatusSchema.optional().catch(undefined),
      })
      .passthrough(),
    success: z.boolean(),
  })
  .passthrough();

export const createBrandSchema = z.object({
  code: makeOptionalCodeSchema("MK"),
  description: optionalTextSchema,
  is_active: z.boolean().default(true),
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
});

export const updateBrandSchema = createBrandSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const createMeasurementUnitSchema = z.object({
  code: makeOptionalCodeSchema("MU"),
  is_active: z.boolean().default(true),
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
  symbol: requiredTrimmedString("Symbol is required."),
});

export const updateMeasurementUnitSchema = createMeasurementUnitSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const createProductCategorySchema = z.object({
  code: makeOptionalCodeSchema("CG"),
  description: optionalTextSchema,
  is_active: z.boolean().default(true),
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
  parent_id: makeOptionalIdSchema("Select a valid parent category."),
});

export const updateProductCategorySchema = createProductCategorySchema.partial().extend({
  is_active: z.boolean().optional(),
});

const taxProfileFormObjectSchema = z.object({
  allows_exoneration: z.boolean().default(false),
  cabys_code: z
    .string()
    .trim()
    .regex(digitsPattern, "CABYS code must contain only digits."),
  code: makeOptionalCodeSchema("TF"),
  description: optionalTextSchema,
  is_active: z.boolean().default(true),
  item_kind: taxProfileItemKindSchema,
  iva_rate: optionalNumberSchema(
    z.coerce
      .number()
      .min(0, "IVA rate must be at least 0.")
      .max(100, "IVA rate cannot exceed 100."),
  ),
  iva_rate_code: optionalTextSchema,
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
  requires_cabys: z.boolean().default(false),
  specific_tax_name: optionalTextSchema,
  specific_tax_rate: optionalNumberSchema(
    z.coerce.number().min(0, "Specific tax rate must be at least 0."),
  ),
  tax_type: taxTypeSchema,
});

function applyTaxProfileRules(
  values: Partial<z.infer<typeof taxProfileFormObjectSchema>>,
  ctx: z.RefinementCtx,
) {
  if (values.tax_type === "iva" && values.iva_rate === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "IVA rate is required when tax type is IVA.",
      path: ["iva_rate"],
    });
  }

  if (values.tax_type === "specific_tax") {
    if (!values.specific_tax_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specific tax name is required.",
        path: ["specific_tax_name"],
      });
    }

    if (values.specific_tax_rate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specific tax rate is required.",
        path: ["specific_tax_rate"],
      });
    }
  }
}

export const createTaxProfileSchema = taxProfileFormObjectSchema.superRefine(applyTaxProfileRules);

export const updateTaxProfileSchema = taxProfileFormObjectSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  })
  .superRefine(applyTaxProfileRules);

export const createWarrantyProfileSchema = z.object({
  code: makeOptionalCodeSchema("WP"),
  coverage_notes: optionalTextSchema,
  duration_unit: warrantyDurationUnitSchema,
  duration_value: z.coerce.number().int().min(1, "Duration value must be at least 1."),
  is_active: z.boolean().default(true),
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
});

export const updateWarrantyProfileSchema = createWarrantyProfileSchema.partial().extend({
  is_active: z.boolean().optional(),
});

const productFormObjectSchema = z.object({
  allow_negative_stock: z.boolean().default(false),
  barcode: optionalTextSchema,
  brand_id: makeOptionalIdSchema("Select a valid brand."),
  category_id: makeOptionalIdSchema("Select a valid category."),
  code: makeOptionalCodeSchema("PD"),
  description: optionalTextSchema,
  has_variants: z.boolean().default(false),
  has_warranty: z.boolean().default(false),
  is_active: z.boolean().default(true),
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
  sale_unit_id: makeOptionalIdSchema("Select a valid sale unit."),
  sku: optionalTextSchema,
  stock_unit_id: makeOptionalIdSchema("Select a valid stock unit."),
  tax_profile_id: z.string().regex(positiveIntegerPattern, "Select a valid tax profile."),
  track_expiration: z.boolean().default(false),
  track_inventory: z.boolean().default(false),
  track_lots: z.boolean().default(false),
  type: productTypeSchema,
  warranty_profile_id: makeOptionalIdSchema("Select a valid warranty profile."),
});

function applyProductRules(
  values: Partial<z.infer<typeof productFormObjectSchema>>,
  ctx: z.RefinementCtx,
) {
  if (values.type === "service") {
    return;
  }

  if (values.track_lots && !values.track_inventory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Lot tracking requires inventory tracking.",
      path: ["track_lots"],
    });
  }

  if (values.track_expiration && !values.track_lots) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expiration tracking requires lot tracking.",
      path: ["track_expiration"],
    });
  }

  if (values.has_warranty && !values.warranty_profile_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Warranty profile is required when warranty is enabled.",
      path: ["warranty_profile_id"],
    });
  }

  if (values.sale_unit_id && values.stock_unit_id && values.sale_unit_id !== values.stock_unit_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Sale unit and stock unit must match in the MVP.",
      path: ["sale_unit_id"],
    });
  }
}

export const createProductSchema = productFormObjectSchema.superRefine(applyProductRules);

export const updateProductSchema = productFormObjectSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  })
  .superRefine(applyProductRules);

export const createPriceListSchema = z.object({
  code: makeOptionalCodeSchema("PL"),
  currency: z
    .string()
    .trim()
    .regex(currencyCodePattern, "Currency must use 3 uppercase letters."),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  kind: priceListKindSchema,
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
});

export const updatePriceListSchema = createPriceListSchema.partial().extend({
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
});

const productPriceFormObjectSchema = z.object({
  is_active: z.boolean().default(true),
  min_quantity: optionalNumberSchema(z.coerce.number().min(0, "Minimum quantity must be at least 0.")),
  price: z.coerce.number().min(0, "Price must be at least 0."),
  price_list_id: z.string().regex(positiveIntegerPattern, "Select a valid price list."),
  product_variant_id: makeOptionalIdSchema("Select a valid variant."),
  valid_from: optionalDateTimeSchema,
  valid_to: optionalDateTimeSchema,
});

const refineProductPriceDateRange = createDateRangeRefiner(
  "valid_from",
  "valid_to",
  "Valid to cannot be before valid from.",
);

export const createProductPriceSchema = productPriceFormObjectSchema.superRefine(
  refineProductPriceDateRange,
);

export const updateProductPriceSchema = productPriceFormObjectSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  })
  .superRefine(refineProductPriceDateRange);

const promotionItemFormSchema = z.object({
  bonus_quantity: optionalNumberSchema(z.coerce.number().min(0, "Bonus quantity must be at least 0.")),
  discount_value: optionalNumberSchema(z.coerce.number().min(0, "Discount value must be at least 0.")),
  min_quantity: optionalNumberSchema(z.coerce.number().min(0, "Minimum quantity must be at least 0.")),
  override_price: optionalNumberSchema(z.coerce.number().min(0, "Override price must be at least 0.")),
  product_id: z.string().regex(positiveIntegerPattern, "Select a valid product."),
});

const promotionFormObjectSchema = z.object({
  code: makeOptionalCodeSchema("PN"),
  is_active: z.boolean().default(true),
  items: z.array(promotionItemFormSchema).default([]),
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
  type: promotionTypeSchema,
  valid_from: requiredTrimmedString("Valid from is required."),
  valid_to: requiredTrimmedString("Valid to is required."),
});

function applyPromotionRules(
  values: Partial<z.infer<typeof promotionFormObjectSchema>>,
  ctx: z.RefinementCtx,
) {
  refineProductPriceDateRange(values as Record<string, unknown>, ctx);

  const productIds = new Set<string>();

  values.items?.forEach((item, index) => {
    if (productIds.has(item.product_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Product cannot repeat inside the same promotion.",
        path: ["items", index, "product_id"],
      });
    }

    productIds.add(item.product_id);

    if (
      (values.type === "percentage" || values.type === "fixed_amount") &&
      item.discount_value === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount value is required for this promotion type.",
        path: ["items", index, "discount_value"],
      });
    }

    if (values.type === "price_override" && item.override_price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Override price is required for this promotion type.",
        path: ["items", index, "override_price"],
      });
    }

    if (values.type === "buy_x_get_y") {
      if (item.min_quantity === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimum quantity is required for buy X get Y promotions.",
          path: ["items", index, "min_quantity"],
        });
      }

      if (item.bonus_quantity === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bonus quantity is required for buy X get Y promotions.",
          path: ["items", index, "bonus_quantity"],
        });
      }
    }
  });
}

export const createPromotionSchema = promotionFormObjectSchema.superRefine(applyPromotionRules);

export const updatePromotionSchema = promotionFormObjectSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
    items: z.array(promotionItemFormSchema).optional(),
    valid_from: optionalDateTimeSchema,
    valid_to: optionalDateTimeSchema,
  })
  .superRefine(applyPromotionRules);

export const createWarehouseSchema = z.object({
  branch_id: z.string().regex(positiveIntegerPattern, "Select a valid branch."),
  code: makeOptionalCodeSchema("WH"),
  description: optionalTextSchema,
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
  uses_locations: z.boolean().default(false),
});

export const updateWarehouseSchema = createWarehouseSchema.partial().extend({
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
  uses_locations: z.boolean().optional(),
});

export const createWarehouseLocationSchema = z.object({
  aisle: optionalTextSchema,
  barcode: optionalTextSchema,
  code: makeOptionalCodeSchema("WL"),
  description: optionalTextSchema,
  is_active: z.boolean().default(true),
  is_dispatch_area: z.boolean().default(false),
  is_picking_area: z.boolean().default(false),
  is_receiving_area: z.boolean().default(false),
  level: optionalTextSchema,
  name: requiredTrimmedString("Name must contain at least 2 characters.", 2),
  position: optionalTextSchema,
  rack: optionalTextSchema,
  zone: optionalTextSchema,
});

export const updateWarehouseLocationSchema = createWarehouseLocationSchema.partial().extend({
  is_active: z.boolean().optional(),
  is_dispatch_area: z.boolean().optional(),
  is_picking_area: z.boolean().optional(),
  is_receiving_area: z.boolean().optional(),
});

const inventoryLotDateRangeRefiner = createDateRangeRefiner(
  "manufacturing_date",
  "expiration_date",
  "Expiration date cannot be before manufacturing date.",
);

const inventoryLotCreateFormObjectSchema = z.object({
  code: makeOptionalCodeSchema("LT"),
  expiration_date: optionalDateSchema,
  initial_quantity: z.coerce.number().min(0, "Initial quantity must be at least 0."),
  is_active: z.boolean().default(true),
  location_id: makeOptionalIdSchema("Select a valid warehouse location."),
  lot_number: requiredTrimmedString("Lot number must contain at least 2 characters.", 2),
  manufacturing_date: optionalDateSchema,
  product_id: z.string().regex(positiveIntegerPattern, "Select a valid product."),
  product_variant_id: makeOptionalIdSchema("Select a valid variant."),
  received_at: optionalDateTimeSchema,
  supplier_contact_id: makeOptionalIdSchema("Select a valid supplier contact."),
  unit_cost: optionalNumberSchema(z.coerce.number().min(0, "Unit cost must be at least 0.")),
  warehouse_id: z.string().regex(positiveIntegerPattern, "Select a valid warehouse."),
});

export const createInventoryLotSchema = inventoryLotCreateFormObjectSchema.superRefine(
  inventoryLotDateRangeRefiner,
);

const inventoryLotUpdateFormObjectSchema = z.object({
  code: makeOptionalCodeSchema("LT"),
  expiration_date: optionalDateSchema,
  is_active: z.boolean().default(true),
  location_id: makeOptionalIdSchema("Select a valid warehouse location."),
  lot_number: requiredTrimmedString("Lot number must contain at least 2 characters.", 2),
  manufacturing_date: optionalDateSchema,
  received_at: optionalDateTimeSchema,
  supplier_contact_id: makeOptionalIdSchema("Select a valid supplier contact."),
  unit_cost: optionalNumberSchema(z.coerce.number().min(0, "Unit cost must be at least 0.")),
});

export const updateInventoryLotSchema = inventoryLotUpdateFormObjectSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  })
  .superRefine(inventoryLotDateRangeRefiner);

export const createInventoryAdjustmentSchema = z.object({
  inventory_lot_id: makeOptionalIdSchema("Select a valid inventory lot."),
  location_id: makeOptionalIdSchema("Select a valid warehouse location."),
  movement_type: inventoryAdjustmentTypeSchema,
  notes: optionalTextSchema,
  product_id: z.string().regex(positiveIntegerPattern, "Select a valid product."),
  product_variant_id: makeOptionalIdSchema("Select a valid variant."),
  quantity: z.coerce.number().min(0.0001, "Quantity must be greater than 0."),
  reference_id: optionalNumberSchema(
    z.coerce.number().int().positive("Reference id must be a positive integer."),
  ),
  reference_type: optionalTextSchema,
  warehouse_id: z.string().regex(positiveIntegerPattern, "Select a valid warehouse."),
});

const inventoryTransferFormObjectSchema = z.object({
  destination_warehouse_id: z.string().regex(
    positiveIntegerPattern,
    "Select a valid destination warehouse.",
  ),
  notes: optionalTextSchema,
  origin_warehouse_id: z.string().regex(positiveIntegerPattern, "Select a valid origin warehouse."),
  product_id: z.string().regex(positiveIntegerPattern, "Select a valid product."),
  product_variant_id: makeOptionalIdSchema("Select a valid variant."),
  quantity: z.coerce.number().min(0.0001, "Quantity must be greater than 0."),
  reference_id: optionalNumberSchema(
    z.coerce.number().int().positive("Reference id must be a positive integer."),
  ),
  reference_type: optionalTextSchema,
  unit_cost: optionalNumberSchema(z.coerce.number().min(0, "Unit cost must be at least 0.")),
});

export const createInventoryTransferSchema = inventoryTransferFormObjectSchema.superRefine(
  (values, ctx) => {
    if (values.origin_warehouse_id === values.destination_warehouse_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Origin and destination warehouses must be different.",
        path: ["destination_warehouse_id"],
      });
    }
  },
);

export const cancelInventoryMovementSchema = z.object({
  notes: optionalTextSchema,
});

export const productVariantSchema = z
  .object({
    allow_negative_stock: z.boolean().optional().default(false),
    barcode: z.string().nullable().optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    created_at: z.string().optional(),
    default_warranty_profile: inventoryEntitySummarySchema.nullable().optional().catch(undefined),
    fiscal_profile: inventoryEntitySummarySchema.nullable().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    is_default: z.boolean().optional().default(false),
    product_id: idSchema.optional().catch(undefined),
    sale_unit_measure: measurementUnitSummarySchema.nullable().optional().catch(undefined),
    sku: z.string().catch(""),
    stock_unit_measure: measurementUnitSummarySchema.nullable().optional().catch(undefined),
    track_expiration: z.boolean().optional().default(false),
    track_inventory: z.boolean().optional().default(true),
    track_lots: z.boolean().optional().default(false),
    track_serials: z.boolean().optional().default(false),
    updated_at: z.string().optional(),
    variant_name: z.string().nullable().optional().catch(undefined),
  })
  .passthrough();

export const variantAttributeValueSchema = z
  .object({
    display_order: z.coerce.number().optional().default(0),
    id: idSchema,
    value: z.string().catch(""),
  })
  .passthrough();

export const variantAttributeSchema = z
  .object({
    display_order: z.coerce.number().optional().default(0),
    id: idSchema,
    name: z.string().catch(""),
    values: z.array(variantAttributeValueSchema).optional().default([]),
  })
  .passthrough();

const productVariantFormObjectSchema = z.object({
  allow_negative_stock: z.boolean().default(false),
  barcode: optionalTextSchema,
  default_warranty_profile_id: makeOptionalIdSchema("Select a valid warranty profile."),
  fiscal_profile_id: z.string().regex(positiveIntegerPattern, "Select a valid tax profile."),
  is_active: z.boolean().default(true),
  sale_unit_measure_id: makeOptionalIdSchema("Select a valid sale unit."),
  sku: requiredTrimmedString("SKU is required."),
  stock_unit_measure_id: makeOptionalIdSchema("Select a valid stock unit."),
  track_expiration: z.boolean().default(false),
  track_inventory: z.boolean().default(true),
  track_lots: z.boolean().default(false),
  track_serials: z.boolean().default(false),
  variant_name: requiredTrimmedString("Variant name is required."),
});

function applyVariantRules(
  values: Partial<z.infer<typeof productVariantFormObjectSchema>>,
  ctx: z.RefinementCtx,
) {
  if (values.track_lots && !values.track_inventory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Lot tracking requires inventory tracking.",
      path: ["track_lots"],
    });
  }

  if (values.track_expiration && !values.track_lots) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expiration tracking requires lot tracking.",
      path: ["track_expiration"],
    });
  }

  if (values.track_serials && !values.track_inventory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Serial tracking requires inventory tracking.",
      path: ["track_serials"],
    });
  }
}

export const createProductVariantSchema =
  productVariantFormObjectSchema.superRefine(applyVariantRules);

export const updateProductVariantSchema = productVariantFormObjectSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  })
  .superRefine(applyVariantRules);
