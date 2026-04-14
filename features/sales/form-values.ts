import type { CreateSaleOrderInput, CreateSaleOrderLineInput, CreateSaleOrderDeliveryChargeInput, EmitElectronicDocumentInput, SaleOrder } from "./types";

export const emptySaleOrderLineFormValues: CreateSaleOrderLineInput = {
  discount_percent: 0,
  notes: "",
  product_variant_id: "",
  quantity: 1,
  serial_ids: [],
  tax_amount: 0,
  unit_price: 0,
};

export const emptySaleOrderDeliveryChargeFormValues: CreateSaleOrderDeliveryChargeInput = {
  amount: 0,
  charge_type: "shipping",
  notes: "",
};

export const emptySaleOrderFormValues: CreateSaleOrderInput = {
  branch_id: "",
  code: "",
  customer_contact_id: "",
  delivery_address: "",
  delivery_canton: "",
  delivery_charges: [],
  delivery_district: "",
  delivery_latitude: null,
  delivery_longitude: null,
  delivery_province: "",
  delivery_requested_date: "",
  delivery_zone_id: undefined,
  fulfillment_mode: "pickup",
  internal_notes: "",
  lines: [],
  notes: "",
  order_date: new Date().toISOString().split("T")[0],
  sale_mode: "branch_direct",
  seller_user_id: undefined,
  warehouse_id: undefined,
};

export const emptyEmitDocumentFormValues: EmitElectronicDocumentInput = {
  sale_order_id: "",
  document_type: "factura_electronica",
  receiver_name: "",
  receiver_identification_type: "",
  receiver_identification_number: "",
  receiver_email: "",
};

export function getSaleOrderFormValues(order: SaleOrder): CreateSaleOrderInput {
  return {
    branch_id: String(order.branch?.id ?? ""),
    code: order.code ?? "",
    customer_contact_id: String(order.customer_contact?.id ?? ""),
    delivery_address: order.delivery_address ?? "",
    delivery_canton: order.delivery_canton ?? "",
    delivery_charges: (order.delivery_charges ?? []).map((charge) => ({
      amount: charge.amount,
      charge_type: charge.charge_type as "shipping" | "installation" | "express",
      notes: charge.notes ?? "",
    })),
    delivery_district: order.delivery_district ?? "",
    delivery_latitude: order.delivery_latitude ?? null,
    delivery_longitude: order.delivery_longitude ?? null,
    delivery_province: order.delivery_province ?? "",
    delivery_requested_date: order.delivery_requested_date ?? "",
    delivery_zone_id: order.delivery_zone_id != null ? String(order.delivery_zone_id) : undefined,
    fulfillment_mode: order.fulfillment_mode,
    internal_notes: order.internal_notes ?? "",
    lines: (order.lines ?? []).map((line) => ({
      discount_percent: line.discount_percent ?? 0,
      notes: line.notes ?? "",
      product_variant_id: String(line.product_variant_id ?? line.product_variant?.id ?? ""),
      quantity: line.quantity,
      serial_ids: (line.assigned_serials ?? []).map((s) => Number(s.product_serial_id)),
      tax_amount: line.tax_amount ?? 0,
      unit_price: line.unit_price,
    })),
    notes: order.notes ?? "",
    order_date: typeof order.order_date === "string" ? order.order_date.split("T")[0] : "",
    sale_mode: order.sale_mode,
    seller_user_id: order.seller_user_id != null ? String(order.seller_user_id) : undefined,
    warehouse_id: order.warehouse_id != null ? String(order.warehouse_id) : undefined,
  };
}
