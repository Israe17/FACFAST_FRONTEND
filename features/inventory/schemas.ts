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
  priceListKindValues,
  productTypeValues,
  promotionTypeValues,
  serialEventTypeValues,
  serialStatusValues,
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
const nullableOptionalTextSchema = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}, z.union([z.string(), z.null()]).optional());
const optionalDateTimeSchema = optionalTrimmedString(z.string());
const optionalDateSchema = optionalTrimmedString(z.string());

function makeOptionalCodeSchema(prefix: string) {
  return optionalTrimmedString(
    z.string().regex(new RegExp(`^${prefix}-\\d{4,}$`), `Usa un codigo como ${prefix}-0001.`),
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
const inventoryAdjustmentTypeSchema = z.enum(inventoryAdjustmentTypeValues);
const ledgerInventoryMovementHeaderTypeSchema = z.enum(ledgerInventoryMovementHeaderTypeValues);
const inventoryMovementStatusSchema = z.enum(inventoryMovementStatusValues);
const serialStatusSchema = z.enum(serialStatusValues);
const serialEventTypeSchema = z.enum(serialEventTypeValues);

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
    is_active: z.boolean().optional().default(true),
    is_default: z.boolean().optional().default(false),
    sku: z.string().nullable().optional().catch(undefined),
    track_serials: z.boolean().optional().default(false),
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

const lifecycleSchema = z
  .object({
    can_deactivate: z.boolean().optional().default(false),
    can_delete: z.boolean().optional().default(false),
    can_reactivate: z.boolean().optional().default(false),
    reasons: z.array(z.string()).optional().default([]),
  })
  .passthrough();

const lifecycleFieldSchema = z.preprocess(
  (value) => (value == null ? {} : value),
  lifecycleSchema,
);

export const brandSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    description: z.string().nullable().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    lifecycle: lifecycleFieldSchema,
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
    lifecycle: lifecycleFieldSchema,
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
    lifecycle: lifecycleFieldSchema,
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
    lifecycle: lifecycleFieldSchema,
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
    lifecycle: lifecycleFieldSchema,
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
    lifecycle: lifecycleFieldSchema,
    name: z.string().catch("Product"),
    sale_unit: measurementUnitSummarySchema.nullable().optional().catch(undefined),
    sku: z.string().nullable().optional().catch(undefined),
    stock_unit: measurementUnitSummarySchema.nullable().optional().catch(undefined),
    tax_profile: taxProfileSummarySchema.nullable().optional().catch(undefined),
    track_expiration: z.boolean().optional().default(false),
    track_inventory: z.boolean().optional().default(false),
    track_lots: z.boolean().optional().default(false),
    track_serials: z.boolean().optional().default(false),
    type: productTypeSchema.optional().catch(undefined),
    updated_at: z.string().optional(),
    variants: z.array(productVariantSummarySchema).optional().default([]),
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
    lifecycle: lifecycleFieldSchema,
    name: z.string().catch("Price list"),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const priceListBranchAssignmentSchema = z
  .object({
    branch: branchSummarySchema,
    business_id: idSchema.optional().catch(undefined),
    created_at: z.string().optional(),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    is_default: z.boolean().optional().default(false),
    lifecycle: lifecycleFieldSchema,
    notes: z.string().nullable().optional().catch(undefined),
    price_list: priceListSummarySchema.nullable().optional().catch(undefined),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const priceListBranchAssignmentsResponseSchema = z
  .object({
    assignments: z.array(priceListBranchAssignmentSchema).optional().default([]),
    price_list_id: idSchema,
  })
  .passthrough();

export const branchPriceListsResponseSchema = z
  .object({
    assignments: z.array(priceListBranchAssignmentSchema).optional().default([]),
    branch_id: idSchema,
    default_price_list_id: nullableIdSchema.default(null),
  })
  .passthrough();

export const productPriceSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    created_at: z.string().optional(),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    lifecycle: lifecycleFieldSchema,
    min_quantity: z.coerce.number().optional().catch(undefined),
    price: z.coerce.number().optional().catch(undefined),
    price_list: priceListSummarySchema.nullable().optional().catch(undefined),
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
    product_variant: productVariantSummarySchema.nullable().optional().catch(undefined),
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
    lifecycle: lifecycleFieldSchema,
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
    lifecycle: lifecycleFieldSchema,
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
    lifecycle: lifecycleFieldSchema,
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
    product_variant: productVariantSummarySchema.nullable().optional().catch(undefined),
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
    lifecycle: lifecycleFieldSchema,
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

export const inventoryMovementLineSchema = z
  .object({
    created_at: z.string().optional(),
    id: idSchema,
    incoming_delta: z.coerce.number().optional().catch(undefined),
    inventory_lot: inventoryLotSummarySchema.nullable().optional().catch(undefined),
    line_no: z.coerce.number().optional().catch(undefined),
    linked_line_id: nullableIdSchema.default(null),
    location: warehouseLocationSummarySchema.nullable().optional().catch(undefined),
    on_hand_delta: z.coerce.number().optional().catch(undefined),
    outgoing_delta: z.coerce.number().optional().catch(undefined),
    product: inventoryEntityWithTypeSummarySchema,
    product_variant: productVariantSummarySchema.nullable().optional().catch(undefined),
    quantity: z.coerce.number().optional().catch(undefined),
    reserved_delta: z.coerce.number().optional().catch(undefined),
    total_cost: z.coerce.number().nullable().optional().catch(undefined),
    unit_cost: z.coerce.number().nullable().optional().catch(undefined),
    updated_at: z.string().optional(),
    warehouse: warehouseSummarySchema,
  })
  .passthrough();

const promotionSummarySchema = z
  .object({
    code: z.string().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    name: z.string().catch("Promotion"),
    type: promotionTypeSchema.optional().catch(undefined),
    valid_from: z.string().nullable().optional().catch(undefined),
    valid_to: z.string().nullable().optional().catch(undefined),
  })
  .passthrough();

export const promotionBranchAssignmentSchema = z
  .object({
    branch: branchSummarySchema,
    business_id: idSchema.optional().catch(undefined),
    created_at: z.string().optional(),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    lifecycle: lifecycleFieldSchema,
    notes: z.string().nullable().optional().catch(undefined),
    promotion: promotionSummarySchema.nullable().optional().catch(undefined),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const promotionBranchAssignmentsResponseSchema = z
  .object({
    assignments: z.array(promotionBranchAssignmentSchema).optional().default([]),
    promotion_id: idSchema,
  })
  .passthrough();

export const branchPromotionsResponseSchema = z
  .object({
    assignments: z.array(promotionBranchAssignmentSchema).optional().default([]),
    branch_id: idSchema,
  })
  .passthrough();

export const inventoryMovementHeaderSchema = z
  .object({
    branch: branchSummarySchema.nullable().optional().catch(undefined),
    branch_id: idSchema.optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    id: idSchema,
    legacy_movement_ids: z.array(idSchema).optional().default([]),
    legacy_movements: z.array(z.unknown()).optional().default([]),
    line_count: z.coerce.number().optional().catch(undefined),
    lines: z.array(inventoryMovementLineSchema).optional().default([]),
    movement_type: ledgerInventoryMovementHeaderTypeSchema.optional().catch(undefined),
    notes: z.string().nullable().optional().catch(undefined),
    occurred_at: z.string().optional(),
    performed_by: userSummarySchema.nullable().optional().catch(undefined),
    source_document_id: nullableIdSchema.default(null),
    source_document_number: z.string().nullable().optional().catch(undefined),
    source_document_type: z.string().nullable().optional().catch(undefined),
    status: inventoryMovementStatusSchema.optional().catch(undefined),
    transferred_serial_ids: z.array(idSchema).optional().default([]),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const inventoryAdjustmentResponseSchema = inventoryMovementHeaderSchema;
export const inventoryTransferResponseSchema = inventoryMovementHeaderSchema;

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

export const hardDeleteResponseSchema = z
  .object({
    id: idSchema,
  })
  .passthrough();

export const productSerialSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    created_at: z.string().optional(),
    id: idSchema,
    notes: z.string().nullable().optional().catch(undefined),
    product_variant: productVariantSummarySchema.nullable().optional().catch(undefined),
    product_variant_id: idSchema.optional().catch(undefined),
    received_at: z.string().nullable().optional().catch(undefined),
    serial_number: z.string().catch(""),
    sold_at: z.string().nullable().optional().catch(undefined),
    status: serialStatusSchema,
    updated_at: z.string().optional(),
    warehouse: warehouseSummarySchema.nullable().optional().catch(undefined),
  })
  .passthrough();

export const serialEventSchema = z
  .object({
    contact_id: nullableIdSchema.default(null),
    created_at: z.string().optional(),
    event_type: serialEventTypeSchema,
    from_warehouse: warehouseSummarySchema.nullable().optional().catch(undefined),
    id: idSchema,
    movement_header_id: nullableIdSchema.default(null),
    notes: z.string().nullable().optional().catch(undefined),
    occurred_at: z.string().optional(),
    performed_by_user_id: nullableIdSchema.default(null),
    serial_id: idSchema,
    to_warehouse: warehouseSummarySchema.nullable().optional().catch(undefined),
  })
  .passthrough();

export const createProductSerialsSchema = z.object({
  serial_numbers: z
    .array(requiredTrimmedString("El numero de serie es requerido."))
    .min(1, "Se requiere al menos un numero de serie."),
  warehouse_id: z.string().regex(positiveIntegerPattern, "Selecciona un almacen valido."),
});

export const updateProductSerialStatusSchema = z.object({
  notes: optionalTextSchema,
  status: serialStatusSchema,
});

export const createBrandSchema = z.object({
  code: makeOptionalCodeSchema("MK"),
  description: optionalTextSchema,
  is_active: z.boolean().default(true),
  name: requiredTrimmedString("El nombre debe tener al menos 2 caracteres.", 2),
});

export const updateBrandSchema = createBrandSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const createMeasurementUnitSchema = z.object({
  code: makeOptionalCodeSchema("MU"),
  is_active: z.boolean().default(true),
  name: requiredTrimmedString("El nombre debe tener al menos 2 caracteres.", 2),
  symbol: requiredTrimmedString("El simbolo es requerido."),
});

export const updateMeasurementUnitSchema = createMeasurementUnitSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const createProductCategorySchema = z.object({
  code: makeOptionalCodeSchema("CG"),
  description: optionalTextSchema,
  is_active: z.boolean().default(true),
  name: requiredTrimmedString("El nombre debe tener al menos 2 caracteres.", 2),
  parent_id: makeOptionalIdSchema("Selecciona una categoria padre valida."),
});

export const updateProductCategorySchema = createProductCategorySchema.partial().extend({
  is_active: z.boolean().optional(),
});

const taxProfileFormObjectSchema = z.object({
  allows_exoneration: z.boolean().default(false),
  cabys_code: z
    .string()
    .trim()
    .regex(digitsPattern, "El codigo CABYS debe contener solo digitos."),
  code: makeOptionalCodeSchema("TF"),
  description: optionalTextSchema,
  is_active: z.boolean().default(true),
  item_kind: taxProfileItemKindSchema,
  iva_rate: optionalNumberSchema(
    z.coerce
      .number()
      .min(0, "La tasa de IVA debe ser al menos 0.")
      .max(100, "La tasa de IVA no puede exceder 100."),
  ),
  iva_rate_code: optionalTextSchema,
  name: requiredTrimmedString("El nombre debe tener al menos 2 caracteres.", 2),
  requires_cabys: z.boolean().default(false),
  specific_tax_name: optionalTextSchema,
  specific_tax_rate: optionalNumberSchema(
    z.coerce.number().min(0, "La tasa de impuesto especifico debe ser al menos 0."),
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
      message: "La tasa de IVA es requerida cuando el tipo de impuesto es IVA.",
      path: ["iva_rate"],
    });
  }

  if (values.tax_type === "specific_tax") {
    if (!values.specific_tax_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El nombre del impuesto especifico es requerido.",
        path: ["specific_tax_name"],
      });
    }

    if (values.specific_tax_rate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La tasa de impuesto especifico es requerida.",
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
  duration_value: z.coerce.number().int().min(1, "El valor de duracion debe ser al menos 1."),
  is_active: z.boolean().default(true),
  name: requiredTrimmedString("El nombre debe tener al menos 2 caracteres.", 2),
});

export const updateWarrantyProfileSchema = createWarrantyProfileSchema.partial().extend({
  is_active: z.boolean().optional(),
});

const productFormObjectSchema = z.object({
  allow_negative_stock: z.boolean().default(false),
  barcode: optionalTextSchema,
  brand_id: makeOptionalIdSchema("Selecciona una marca valida."),
  category_id: makeOptionalIdSchema("Selecciona una categoria valida."),
  code: makeOptionalCodeSchema("PD"),
  description: optionalTextSchema,
  has_variants: z.boolean().default(false),
  has_warranty: z.boolean().default(false),
  is_active: z.boolean().default(true),
  name: requiredTrimmedString("El nombre debe tener al menos 2 caracteres.", 2),
  sale_unit_id: makeOptionalIdSchema("Selecciona una unidad de venta valida."),
  sku: optionalTextSchema,
  stock_unit_id: makeOptionalIdSchema("Selecciona una unidad de inventario valida."),
  tax_profile_id: z.string().regex(positiveIntegerPattern, "Selecciona un perfil fiscal valido."),
  track_expiration: z.boolean().default(false),
  track_inventory: z.boolean().default(false),
  track_lots: z.boolean().default(false),
  track_serials: z.boolean().default(false),
  type: productTypeSchema,
  warranty_profile_id: makeOptionalIdSchema("Selecciona un perfil de garantia valido."),
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
      message: "El rastreo de lotes requiere rastreo de inventario.",
      path: ["track_lots"],
    });
  }

  if (values.track_expiration && !values.track_lots) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El rastreo de vencimiento requiere rastreo de lotes.",
      path: ["track_expiration"],
    });
  }

  if (values.track_serials && !values.track_inventory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El rastreo de seriales requiere rastreo de inventario.",
      path: ["track_serials"],
    });
  }

  if (values.has_warranty && !values.warranty_profile_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El perfil de garantia es requerido cuando la garantia esta habilitada.",
      path: ["warranty_profile_id"],
    });
  }

  if (values.sale_unit_id && values.stock_unit_id && values.sale_unit_id !== values.stock_unit_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La unidad de venta y la unidad de inventario deben coincidir en el MVP.",
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
    .regex(currencyCodePattern, "La moneda debe usar 3 letras mayusculas."),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  kind: priceListKindSchema,
  name: requiredTrimmedString("El nombre debe tener al menos 2 caracteres.", 2),
});

export const updatePriceListSchema = createPriceListSchema.partial().extend({
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
});

export const createPriceListBranchAssignmentSchema = z.object({
  branch_id: z.string().regex(positiveIntegerPattern, "Selecciona una sucursal valida."),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  notes: optionalTextSchema,
});

export const updatePriceListBranchAssignmentSchema = createPriceListBranchAssignmentSchema
  .omit({
    branch_id: true,
  })
  .partial()
  .extend({
    is_active: z.boolean().optional(),
    is_default: z.boolean().optional(),
    notes: nullableOptionalTextSchema,
  });

const productPriceFormObjectSchema = z.object({
  is_active: z.boolean().default(true),
  min_quantity: optionalNumberSchema(z.coerce.number().min(0, "La cantidad minima debe ser al menos 0.")),
  price: z.coerce.number().min(0, "El precio debe ser al menos 0."),
  price_list_id: z.string().regex(positiveIntegerPattern, "Selecciona una lista de precios valida."),
  product_variant_id: makeOptionalIdSchema("Selecciona una variante valida."),
  valid_from: optionalDateTimeSchema,
  valid_to: optionalDateTimeSchema,
});

const refineProductPriceDateRange = createDateRangeRefiner(
  "valid_from",
  "valid_to",
  "La fecha de fin no puede ser anterior a la fecha de inicio.",
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
  bonus_quantity: optionalNumberSchema(z.coerce.number().min(0, "La cantidad de bonificacion debe ser al menos 0.")),
  discount_value: optionalNumberSchema(z.coerce.number().min(0, "El valor de descuento debe ser al menos 0.")),
  min_quantity: optionalNumberSchema(z.coerce.number().min(0, "La cantidad minima debe ser al menos 0.")),
  override_price: optionalNumberSchema(z.coerce.number().min(0, "El precio de sobreescritura debe ser al menos 0.")),
  product_id: makeOptionalIdSchema("Selecciona un producto valido."),
  product_variant_id: makeOptionalIdSchema("Selecciona una variante valida."),
});

const promotionFormObjectSchema = z.object({
  code: makeOptionalCodeSchema("PN"),
  is_active: z.boolean().default(true),
  items: z.array(promotionItemFormSchema).default([]),
  name: requiredTrimmedString("El nombre debe tener al menos 2 caracteres.", 2),
  type: promotionTypeSchema,
  valid_from: requiredTrimmedString("La fecha de inicio es requerida."),
  valid_to: requiredTrimmedString("La fecha de fin es requerida."),
});

function applyPromotionRules(
  values: Partial<z.infer<typeof promotionFormObjectSchema>>,
  ctx: z.RefinementCtx,
) {
  refineProductPriceDateRange(values as Record<string, unknown>, ctx);

  const itemKeys = new Set<string>();

  values.items?.forEach((item, index) => {
    const itemKey = `${item.product_id ?? ""}:${item.product_variant_id ?? ""}`;

    if (!item.product_id && !item.product_variant_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El producto o variante es requerido.",
        path: ["items", index, "product_id"],
      });
    }

    if (itemKeys.has(itemKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El producto o variante no puede repetirse dentro de la misma promocion.",
        path: ["items", index, "product_variant_id"],
      });
    }

    itemKeys.add(itemKey);

    if (
      (values.type === "percentage" || values.type === "fixed_amount") &&
      item.discount_value === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El valor de descuento es requerido para este tipo de promocion.",
        path: ["items", index, "discount_value"],
      });
    }

    if (values.type === "price_override" && item.override_price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El precio de sobreescritura es requerido para este tipo de promocion.",
        path: ["items", index, "override_price"],
      });
    }

    if (values.type === "buy_x_get_y") {
      if (item.min_quantity === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La cantidad minima es requerida para promociones de compra X lleva Y.",
          path: ["items", index, "min_quantity"],
        });
      }

      if (item.bonus_quantity === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La cantidad de bonificacion es requerida para promociones de compra X lleva Y.",
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

export const createPromotionBranchAssignmentSchema = z.object({
  branch_id: z.string().regex(positiveIntegerPattern, "Selecciona una sucursal valida."),
  is_active: z.boolean().default(true),
  notes: optionalTextSchema,
});

export const updatePromotionBranchAssignmentSchema = createPromotionBranchAssignmentSchema
  .omit({
    branch_id: true,
  })
  .partial()
  .extend({
    is_active: z.boolean().optional(),
    notes: nullableOptionalTextSchema,
  });

export const createWarehouseSchema = z.object({
  branch_id: z.string().regex(positiveIntegerPattern, "Selecciona una sucursal valida."),
  code: makeOptionalCodeSchema("WH"),
  description: optionalTextSchema,
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  name: requiredTrimmedString("El nombre debe tener al menos 2 caracteres.", 2),
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
  name: requiredTrimmedString("El nombre debe tener al menos 2 caracteres.", 2),
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
  "La fecha de vencimiento no puede ser anterior a la fecha de fabricacion.",
);

const inventoryLotCreateFormObjectSchema = z.object({
  code: makeOptionalCodeSchema("LT"),
  expiration_date: optionalDateSchema,
  initial_quantity: z.coerce.number().min(0, "La cantidad inicial debe ser al menos 0."),
  is_active: z.boolean().default(true),
  location_id: makeOptionalIdSchema("Selecciona una ubicacion de almacen valida."),
  lot_number: requiredTrimmedString("El numero de lote debe tener al menos 2 caracteres.", 2),
  manufacturing_date: optionalDateSchema,
  product_id: makeOptionalIdSchema("Selecciona un producto valido."),
  product_variant_id: makeOptionalIdSchema("Selecciona una variante valida."),
  received_at: optionalDateTimeSchema,
  supplier_contact_id: makeOptionalIdSchema("Selecciona un proveedor valido."),
  unit_cost: optionalNumberSchema(z.coerce.number().min(0, "El costo unitario debe ser al menos 0.")),
  warehouse_id: z.string().regex(positiveIntegerPattern, "Selecciona un almacen valido."),
});

export const createInventoryLotSchema = inventoryLotCreateFormObjectSchema.superRefine(
  (values, ctx) => {
    inventoryLotDateRangeRefiner(values, ctx);

    if (!values.product_id && !values.product_variant_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El producto o variante es requerido.",
        path: ["product_id"],
      });
    }
  },
);

const inventoryLotUpdateFormObjectSchema = z.object({
  code: makeOptionalCodeSchema("LT"),
  expiration_date: optionalDateSchema,
  is_active: z.boolean().default(true),
  location_id: makeOptionalIdSchema("Selecciona una ubicacion de almacen valida."),
  lot_number: requiredTrimmedString("El numero de lote debe tener al menos 2 caracteres.", 2),
  manufacturing_date: optionalDateSchema,
  received_at: optionalDateTimeSchema,
  supplier_contact_id: makeOptionalIdSchema("Selecciona un proveedor valido."),
  unit_cost: optionalNumberSchema(z.coerce.number().min(0, "El costo unitario debe ser al menos 0.")),
});

export const updateInventoryLotSchema = inventoryLotUpdateFormObjectSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  })
  .superRefine(inventoryLotDateRangeRefiner);

export const createInventoryAdjustmentSchema = z.object({
  inventory_lot_id: makeOptionalIdSchema("Selecciona un lote de inventario valido."),
  location_id: makeOptionalIdSchema("Selecciona una ubicacion de almacen valida."),
  movement_type: inventoryAdjustmentTypeSchema,
  notes: optionalTextSchema,
  product_id: makeOptionalIdSchema("Selecciona un producto valido."),
  product_variant_id: makeOptionalIdSchema("Selecciona una variante valida."),
  quantity: z.coerce.number().min(0.0001, "La cantidad debe ser mayor que 0."),
  reference_id: optionalNumberSchema(
    z.coerce.number().int().positive("El id de referencia debe ser un entero positivo."),
  ),
  reference_type: optionalTextSchema,
  warehouse_id: z.string().regex(positiveIntegerPattern, "Selecciona un almacen valido."),
}).superRefine((values, ctx) => {
  if (!values.product_id && !values.product_variant_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El producto o variante es requerido.",
      path: ["product_id"],
    });
  }
});

const inventoryTransferFormObjectSchema = z.object({
  destination_warehouse_id: z.string().regex(
    positiveIntegerPattern,
    "Selecciona un almacen de destino valido.",
  ),
  destination_location_id: makeOptionalIdSchema("Selecciona una ubicacion de almacen de destino valida."),
  inventory_lot_id: makeOptionalIdSchema("Selecciona un lote de inventario valido."),
  notes: optionalTextSchema,
  origin_location_id: makeOptionalIdSchema("Selecciona una ubicacion de almacen de origen valida."),
  origin_warehouse_id: z.string().regex(positiveIntegerPattern, "Selecciona un almacen de origen valido."),
  product_id: makeOptionalIdSchema("Selecciona un producto valido."),
  product_variant_id: makeOptionalIdSchema("Selecciona una variante valida."),
  quantity: z.coerce.number().min(0.0001, "La cantidad debe ser mayor que 0."),
  reference_id: optionalNumberSchema(
    z.coerce.number().int().positive("El id de referencia debe ser un entero positivo."),
  ),
  reference_type: optionalTextSchema,
  serial_ids: z.array(z.coerce.number().int().positive()).optional().default([]),
  unit_cost: optionalNumberSchema(z.coerce.number().min(0, "El costo unitario debe ser al menos 0.")),
});

export const createInventoryTransferSchema = inventoryTransferFormObjectSchema.superRefine(
  (values, ctx) => {
    if (!values.product_id && !values.product_variant_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El producto o variante es requerido.",
        path: ["product_id"],
      });
    }

    if (values.origin_warehouse_id === values.destination_warehouse_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Los almacenes de origen y destino deben ser diferentes.",
        path: ["destination_warehouse_id"],
      });
    }
  },
);

export const cancelInventoryMovementSchema = z.object({
  notes: optionalTextSchema,
});

const variantAttributeValueRefSchema = z
  .object({
    attribute_id: z.coerce.number().optional(),
    id: idSchema,
    value: z.string().catch(""),
  })
  .passthrough();

export const productVariantSchema = z
  .object({
    allow_negative_stock: z.boolean().optional().default(false),
    attribute_values: z.array(variantAttributeValueRefSchema).optional().default([]),
    barcode: z.string().nullable().optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    created_at: z.string().optional(),
    default_warranty_profile: inventoryEntitySummarySchema.nullable().optional().catch(undefined),
    fiscal_profile: inventoryEntitySummarySchema.nullable().optional().catch(undefined),
    id: idSchema,
    is_active: z.boolean().optional().default(true),
    is_default: z.boolean().optional().default(false),
    lifecycle: lifecycleFieldSchema,
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
  default_warranty_profile_id: makeOptionalIdSchema("Selecciona un perfil de garantia valido."),
  fiscal_profile_id: z.string().regex(positiveIntegerPattern, "Selecciona un perfil fiscal valido."),
  is_active: z.boolean().default(true),
  sale_unit_measure_id: makeOptionalIdSchema("Selecciona una unidad de venta valida."),
  sku: requiredTrimmedString("El SKU es requerido."),
  stock_unit_measure_id: makeOptionalIdSchema("Selecciona una unidad de inventario valida."),
  track_expiration: z.boolean().default(false),
  track_inventory: z.boolean().default(true),
  track_lots: z.boolean().default(false),
  track_serials: z.boolean().default(false),
  variant_name: requiredTrimmedString("El nombre de la variante es requerido."),
});

function applyVariantRules(
  values: Partial<z.infer<typeof productVariantFormObjectSchema>>,
  ctx: z.RefinementCtx,
) {
  if (values.track_lots && !values.track_inventory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El rastreo de lotes requiere rastreo de inventario.",
      path: ["track_lots"],
    });
  }

  if (values.track_expiration && !values.track_lots) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El rastreo de vencimiento requiere rastreo de lotes.",
      path: ["track_expiration"],
    });
  }

  if (values.track_serials && !values.track_inventory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El rastreo de seriales requiere rastreo de inventario.",
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
