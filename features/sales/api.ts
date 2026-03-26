import { http } from "@/shared/lib/http";
import { extractCollection, extractEntity, compactNullableRecord, toNumberId } from "@/shared/lib/api-helpers";
import { withIdempotencyKey } from "@/shared/lib/idempotency";
import { paginatedSchema, cursorSchema, type PaginatedQueryParams, type CursorQueryParams } from "@/shared/lib/api-types";

import { electronicDocumentSchema, saleOrderSchema } from "./schemas";
import type { CreateSaleOrderInput, UpdateSaleOrderInput, CancelSaleOrderInput, EmitElectronicDocumentInput } from "./types";

function buildSaleOrderPayload(payload: CreateSaleOrderInput | UpdateSaleOrderInput) {
  return compactNullableRecord({
    branch_id: toNumberId(payload.branch_id),
    code: payload.code,
    customer_contact_id: toNumberId(payload.customer_contact_id),
    delivery_address: payload.delivery_address,
    delivery_canton: payload.delivery_canton,
    delivery_charges: payload.delivery_charges,
    delivery_district: payload.delivery_district,
    delivery_province: payload.delivery_province,
    delivery_requested_date: payload.delivery_requested_date,
    delivery_zone_id: toNumberId(payload.delivery_zone_id) ?? null,
    fulfillment_mode: payload.fulfillment_mode,
    internal_notes: payload.internal_notes,
    lines: payload.lines?.map((line: { product_variant_id?: string | number | null; [key: string]: unknown }) => ({
      ...line,
      product_variant_id: toNumberId(line.product_variant_id),
    })),
    notes: payload.notes,
    order_date: payload.order_date,
    sale_mode: payload.sale_mode,
    seller_user_id: toNumberId(payload.seller_user_id) ?? null,
    warehouse_id: toNumberId(payload.warehouse_id) ?? null,
  });
}

// ─── Sale Orders ───

export async function listSaleOrders() {
  const response = await http.get("/sale-orders");
  return extractCollection(response.data, ["sale_orders", "sale-orders"]).map((item) =>
    saleOrderSchema.parse(item),
  );
}

export async function listSaleOrdersPaginated(params: PaginatedQueryParams) {
  const response = await http.get("/sale-orders", { params });
  return paginatedSchema(saleOrderSchema).parse(response.data);
}

export async function listSaleOrdersCursor(params: CursorQueryParams) {
  const response = await http.get("/sale-orders/cursor", { params });
  return cursorSchema(saleOrderSchema).parse(response.data);
}

export async function getSaleOrder(orderId: string) {
  const response = await http.get(`/sale-orders/${orderId}`);
  return saleOrderSchema.parse(extractEntity(response.data, ["sale_order", "sale-order"]));
}

export async function createSaleOrder(payload: CreateSaleOrderInput) {
  const response = await http.post("/sale-orders", buildSaleOrderPayload(payload));
  return saleOrderSchema.parse(extractEntity(response.data, ["sale_order", "sale-order"]));
}

export async function updateSaleOrder(orderId: string, payload: UpdateSaleOrderInput) {
  const response = await http.patch(`/sale-orders/${orderId}`, buildSaleOrderPayload(payload));
  return saleOrderSchema.parse(extractEntity(response.data, ["sale_order", "sale-order"]));
}

export async function confirmSaleOrder(orderId: string) {
  const response = await http.post(`/sale-orders/${orderId}/confirm`, undefined, withIdempotencyKey());
  return saleOrderSchema.parse(extractEntity(response.data, ["sale_order", "sale-order"]));
}

export async function cancelSaleOrder(orderId: string, payload: CancelSaleOrderInput) {
  const response = await http.post(`/sale-orders/${orderId}/cancel`, payload, withIdempotencyKey());
  return saleOrderSchema.parse(extractEntity(response.data, ["sale_order", "sale-order"]));
}

export async function deleteSaleOrder(orderId: string) {
  await http.delete(`/sale-orders/${orderId}`);
}

// ─── Electronic Documents ───

export async function listElectronicDocuments() {
  const response = await http.get("/electronic-documents");
  return extractCollection(response.data, ["electronic_documents"]).map((item) =>
    electronicDocumentSchema.parse(item),
  );
}

export async function listElectronicDocumentsPaginated(params: PaginatedQueryParams) {
  const response = await http.get("/electronic-documents", { params });
  return paginatedSchema(electronicDocumentSchema).parse(response.data);
}

export async function listElectronicDocumentsCursor(params: CursorQueryParams) {
  const response = await http.get("/electronic-documents/cursor", { params });
  return cursorSchema(electronicDocumentSchema).parse(response.data);
}

export async function getElectronicDocument(documentId: string) {
  const response = await http.get(`/electronic-documents/${documentId}`);
  return electronicDocumentSchema.parse(extractEntity(response.data, ["electronic_document"]));
}

export async function emitElectronicDocument(payload: EmitElectronicDocumentInput) {
  const response = await http.post("/electronic-documents/emit", payload, withIdempotencyKey());
  return electronicDocumentSchema.parse(extractEntity(response.data, ["electronic_document"]));
}
