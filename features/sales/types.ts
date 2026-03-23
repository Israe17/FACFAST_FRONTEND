import { z } from "zod/v4";

import {
  saleOrderLineSchema,
  createSaleOrderLineSchema,
  saleOrderDeliveryChargeSchema,
  createSaleOrderDeliveryChargeSchema,
  saleOrderSchema,
  createSaleOrderSchema,
  updateSaleOrderSchema,
  cancelSaleOrderSchema,
  electronicDocumentSchema,
  emitElectronicDocumentSchema,
} from "./schemas";

export type SaleOrderLine = z.infer<typeof saleOrderLineSchema>;
export type CreateSaleOrderLineInput = z.infer<typeof createSaleOrderLineSchema>;
export type SaleOrderDeliveryCharge = z.infer<typeof saleOrderDeliveryChargeSchema>;
export type CreateSaleOrderDeliveryChargeInput = z.infer<typeof createSaleOrderDeliveryChargeSchema>;
export type SaleOrder = z.infer<typeof saleOrderSchema>;
export type CreateSaleOrderInput = z.infer<typeof createSaleOrderSchema>;
export type UpdateSaleOrderInput = z.infer<typeof updateSaleOrderSchema>;
export type CancelSaleOrderInput = z.infer<typeof cancelSaleOrderSchema>;
export type ElectronicDocument = z.infer<typeof electronicDocumentSchema>;
export type EmitElectronicDocumentInput = z.infer<typeof emitElectronicDocumentSchema>;
