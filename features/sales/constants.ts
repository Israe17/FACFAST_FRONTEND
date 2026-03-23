export const saleModeValues = ["branch_direct", "seller_attributed", "seller_route"] as const;
export const fulfillmentModeValues = ["pickup", "delivery"] as const;
export const saleOrderStatusValues = ["draft", "confirmed", "cancelled"] as const;
export const saleDispatchStatusValues = ["pending", "dispatched", "delivered", "cancelled"] as const;
export const deliveryChargeTypeValues = ["shipping", "installation", "express"] as const;
export const electronicDocumentTypeValues = ["factura_electronica", "tiquete_electronico", "nota_credito", "nota_debito"] as const;
export const haciendaStatusValues = ["pending", "submitted", "accepted", "rejected", "error"] as const;
