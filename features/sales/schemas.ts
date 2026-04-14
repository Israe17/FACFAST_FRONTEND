import { z } from "zod/v4";

import { idSchema, nullableIdSchema } from "@/shared/lib/api-types";
import {
  optionalTrimmedString,
  positiveIntegerPattern,
  requiredTrimmedString,
} from "@/shared/lib/validation";

import {
  deliveryChargeTypeValues,
  electronicDocumentTypeValues,
  fulfillmentModeValues,
  haciendaStatusValues,
  saleDispatchStatusValues,
  saleModeValues,
  saleOrderStatusValues,
} from "./constants";
const optionalTextSchema = optionalTrimmedString(z.string());

const lifecycleFieldSchema = z
  .object({
    can_cancel: z.boolean().optional().catch(false),
    can_cancel_lines: z.boolean().optional().catch(false),
    can_confirm: z.boolean().optional().catch(false),
    can_delete: z.boolean().optional().catch(false),
    can_edit: z.boolean().optional().catch(false),
    can_reset_dispatch: z.boolean().optional().catch(false),
    reasons: z.array(z.string()).optional().catch([]),
  })
  .optional()
  .catch({});

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

// --- Sale Order Line ---

export const saleOrderLineSchema = z
  .object({
    business_id: idSchema.optional().catch(undefined),
    created_at: z.string().optional(),
    discount_percent: z.number().optional().catch(0),
    id: idSchema,
    line_no: z.number(),
    line_total: z.number(),
    notes: z.string().nullable().optional().catch(null),
    product_variant: z
      .object({
        id: idSchema,
        variant_name: z.string().nullable().optional(),
        sku: z.string().optional(),
        product: z
          .object({
            id: idSchema,
            name: z.string(),
          })
          .optional()
          .catch(undefined),
      })
      .optional()
      .catch(undefined),
    product_variant_id: idSchema.optional(),
    quantity: z.number(),
    reservation: z
      .object({
        status: z.string(),
        reserved_quantity: z.number(),
        consumed_quantity: z.number(),
        released_quantity: z.number(),
      })
      .nullable()
      .optional()
      .catch(null),
    sale_order_id: idSchema.optional(),
    status: z.string().optional().catch("active"),
    tax_amount: z.number().optional().catch(0),
    unit_price: z.number(),
    assigned_serials: z
      .array(
        z.object({
          id: idSchema,
          product_serial_id: idSchema,
          serial_number: z.string(),
          status: z.string(),
          assigned_at: z.string().nullable().optional(),
        }),
      )
      .optional()
      .catch([]),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const createSaleOrderLineSchema = z.object({
  discount_percent: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().min(0).max(100).default(0),
  ),
  line_total: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0).optional(),
  ),
  notes: optionalTextSchema,
  product_variant_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : String(v)),
    z.string().regex(positiveIntegerPattern, "Selecciona una variante."),
  ),
  quantity: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().positive("La cantidad debe ser mayor a 0."),
  ),
  tax_amount: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().min(0).default(0),
  ),
  unit_price: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0, "El precio debe ser 0 o mayor."),
  ),
  serial_ids: z.array(z.number()).optional().default([]),
});

// --- Sale Order Delivery Charge ---

export const saleOrderDeliveryChargeSchema = z
  .object({
    amount: z.number(),
    charge_type: z.string(),
    created_at: z.string().optional(),
    id: idSchema,
    notes: z.string().nullable().optional().catch(null),
    sale_order_id: idSchema.optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const createSaleOrderDeliveryChargeSchema = z.object({
  amount: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0, "El monto debe ser 0 o mayor."),
  ),
  charge_type: z.enum(deliveryChargeTypeValues),
  notes: optionalTextSchema,
});

// --- Sale Order ---

export const saleOrderSchema = z
  .object({
    branch_id: idSchema.optional(),
    branch: z.object({ id: idSchema, name: z.string().nullable() }).optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    created_at: z.string().optional(),
    created_by_user_id: idSchema.optional(),
    created_by_user: z.object({ id: idSchema, name: z.string() }).optional().catch(undefined),
    customer_contact_id: idSchema.optional(),
    customer_contact: z
      .object({ id: idSchema, name: z.string() })
      .optional()
      .catch(undefined),
    delivery_address: z.string().nullable().optional().catch(null),
    delivery_canton: z.string().nullable().optional().catch(null),
    delivery_charges: z.array(saleOrderDeliveryChargeSchema).optional().catch([]),
    delivery_district: z.string().nullable().optional().catch(null),
    delivery_latitude: z.number().nullable().optional().catch(null),
    delivery_longitude: z.number().nullable().optional().catch(null),
    delivery_province: z.string().nullable().optional().catch(null),
    delivery_requested_date: z.string().nullable().optional().catch(null),
    delivery_zone: z.object({ id: idSchema, name: z.string() }).nullable().optional().catch(null),
    delivery_zone_id: nullableIdSchema.catch(null),
    dispatch_orders: z
      .array(
        z.object({
          id: idSchema,
          code: z.string().nullable().optional(),
          status: z.string(),
          scheduled_date: z.string().nullable().optional(),
        }),
      )
      .optional()
      .catch([]),
    dispatch_status: z.enum(saleDispatchStatusValues).catch("pending"),
    fulfillment_mode: z.enum(fulfillmentModeValues).catch("pickup"),
    id: idSchema,
    internal_notes: z.string().nullable().optional().catch(null),
    lifecycle: lifecycleFieldSchema,
    lines: z.array(saleOrderLineSchema).optional().catch([]),
    notes: z.string().nullable().optional().catch(null),
    order_date: z.string(),
    sale_mode: z.enum(saleModeValues).catch("branch_direct"),
    seller: z.object({ id: idSchema, name: z.string() }).nullable().optional().catch(null),
    seller_user_id: nullableIdSchema.catch(null),
    status: z.enum(saleOrderStatusValues).catch("draft"),
    updated_at: z.string().optional(),
    warehouse: z.object({ id: idSchema, name: z.string() }).nullable().optional().catch(null),
    warehouse_id: nullableIdSchema.catch(null),
  })
  .passthrough();

const saleOrderFormObjectSchema = z.object({
  branch_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : String(v)),
    z.string().regex(positiveIntegerPattern, "Selecciona una sucursal."),
  ),
  code: makeOptionalCodeSchema("SO"),
  customer_contact_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : String(v)),
    z.string().regex(positiveIntegerPattern, "Selecciona un cliente."),
  ),
  delivery_address: optionalTextSchema,
  delivery_canton: optionalTextSchema,
  delivery_charges: z.array(createSaleOrderDeliveryChargeSchema).optional().default([]),
  delivery_district: optionalTextSchema,
  delivery_latitude: z.number().nullable().optional().catch(null),
  delivery_longitude: z.number().nullable().optional().catch(null),
  delivery_province: optionalTextSchema,
  delivery_requested_date: optionalTextSchema,
  delivery_zone_id: makeOptionalIdSchema("Selecciona una zona."),
  fulfillment_mode: z.enum(fulfillmentModeValues).default("pickup"),
  internal_notes: optionalTextSchema,
  lines: z.array(createSaleOrderLineSchema).min(1, "Agrega al menos una linea."),
  notes: optionalTextSchema,
  order_date: z.string().min(1, "La fecha es requerida."),
  sale_mode: z.enum(saleModeValues).default("branch_direct"),
  seller_user_id: makeOptionalIdSchema("Selecciona un vendedor."),
  warehouse_id: makeOptionalIdSchema("Selecciona una bodega."),
});

function applySaleOrderModeRules(
  values: z.input<typeof saleOrderFormObjectSchema>,
  ctx: z.RefinementCtx,
) {
  if (values.fulfillment_mode === "delivery") {
    if (!values.warehouse_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La bodega es requerida para modo entrega.",
        path: ["warehouse_id"],
      });
    }
    if (!values.delivery_address?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La direccion de entrega es requerida para modo entrega.",
        path: ["delivery_address"],
      });
    }
  }

  if (
    (values.sale_mode === "seller_attributed" || values.sale_mode === "seller_route") &&
    !values.seller_user_id
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El vendedor es requerido para este modo de venta.",
      path: ["seller_user_id"],
    });
  }
}

export const createSaleOrderSchema = saleOrderFormObjectSchema.superRefine(applySaleOrderModeRules);

export const updateSaleOrderSchema = saleOrderFormObjectSchema.partial().superRefine(applySaleOrderModeRules);

export const cancelSaleOrderSchema = z.object({
  reason: optionalTextSchema,
});

export const cancelSaleOrderLineSchema = z.object({
  reason: optionalTextSchema,
});

// --- Electronic Document ---

export const electronicDocumentSchema = z
  .object({
    id: idSchema,
    code: z.string().optional().catch(undefined),
    business_id: idSchema.optional().catch(undefined),
    branch_id: idSchema.optional(),
    branch: z.object({ id: idSchema, name: z.string().nullable() }).nullable().optional().catch(null),
    sale_order: z.object({ id: idSchema, code: z.string().nullable().optional() }).nullable().optional().catch(null),
    document_type: z.enum(electronicDocumentTypeValues).catch("factura_electronica"),
    document_key: z.string().nullable().optional().catch(null),
    consecutive: z.string().nullable().optional().catch(null),
    emission_date: z.string().optional(),
    currency: z.string().optional().catch("CRC"),
    subtotal: z.number().optional().catch(0),
    tax_total: z.number().optional().catch(0),
    discount_total: z.number().optional().catch(0),
    total: z.number().optional().catch(0),
    receiver_name: z.string().optional().catch(""),
    receiver_identification_type: z.string().nullable().optional().catch(null),
    receiver_identification_number: z.string().nullable().optional().catch(null),
    receiver_email: z.string().nullable().optional().catch(null),
    hacienda_status: z.enum(haciendaStatusValues).catch("pending"),
    hacienda_message: z.string().nullable().optional().catch(null),
    submitted_at: z.string().nullable().optional().catch(null),
    accepted_at: z.string().nullable().optional().catch(null),
    lifecycle: z.object({
      can_resubmit: z.boolean().optional().catch(false),
      reasons: z.array(z.string()).optional().catch([]),
    }).optional().catch({}),
    assets: z.object({
      has_xml: z.boolean().optional().catch(false),
      has_pdf: z.boolean().optional().catch(false),
    }).optional().catch({}),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const emitElectronicDocumentSchema = z.object({
  sale_order_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : String(v)),
    z.string().regex(positiveIntegerPattern, "Selecciona una orden de venta."),
  ),
  document_type: z.enum(electronicDocumentTypeValues).default("factura_electronica"),
  receiver_name: optionalTrimmedString(z.string()),
  receiver_identification_type: optionalTrimmedString(z.string()),
  receiver_identification_number: optionalTrimmedString(z.string()),
  receiver_email: optionalTrimmedString(z.string()),
});
