# Inventory Deletion Safety Policy

## Overview

This document describes the deletion policy for all inventory module entities. The policy distinguishes between **hard delete** (permanent removal), **soft delete** (deactivation via `is_active = false`), and **blocked** (cannot delete at all).

---

## Policy Matrix

| Entity | Policy | Conditions | Backend Error Codes |
|--------|--------|------------|---------------------|
| **Brand** | Hard delete | Blocks if any product references it | `BRAND_IN_USE` |
| **ProductCategory** | Hard delete | Blocks if has children OR any product uses it | `CATEGORY_HAS_CHILDREN`, `CATEGORY_IN_USE` |
| **MeasurementUnit** | Hard delete | Blocks if any product or variant uses it (stock_unit, sale_unit, or measure fields) | `MEASUREMENT_UNIT_IN_USE` |
| **WarrantyProfile** | Hard delete | Blocks if any product or variant references it | `WARRANTY_PROFILE_IN_USE` |
| **TaxProfile** | Not implemented (deactivate only) | Has RESTRICT FK — cannot hard delete | — |
| **PriceList** | Hard delete + cascade | Blocks if it's the default list. Cascades: deletes all ProductPrices in the list first | `CANNOT_DELETE_DEFAULT_PRICE_LIST` |
| **ProductPrice** | Hard delete | No restrictions — always deletable | — |
| **Promotion** | Hard delete + cascade | No restrictions. Cascades: deletes all PromotionItems first | — |
| **Product** | Soft delete (deactivate) | Too many operational dependencies | — |
| **Warehouse** | Soft delete (deactivate) | Has stock, lots, movements | — |
| **InventoryLot** | Soft delete (deactivate) | Has movement history | — |

---

## Hard Delete

When a hard delete is performed, the entity is permanently removed from the database. This is only allowed when:

1. No other entity has an inbound foreign key that would restrict the deletion.
2. The FK constraint on dependent entities is `SET NULL` (nullable FK), meaning dependents are automatically unlinked on deletion.

### FK behavior for hard-deleted entities

| Entity | Dependent FK constraint |
|--------|------------------------|
| Brand | `Product.brand_id` → SET NULL |
| ProductCategory | `Product.category_id` → SET NULL |
| MeasurementUnit | `Product.stock_unit_id` → SET NULL, `Product.sale_unit_id` → SET NULL, `ProductVariant.stock_unit_measure_id` → SET NULL, `ProductVariant.sale_unit_measure_id` → SET NULL |
| WarrantyProfile | `Product.default_warranty_profile_id` → SET NULL, `ProductVariant.default_warranty_profile_id` → SET NULL |
| PriceList | `ProductPrice.price_list_id` — cascade (we delete prices first manually) |
| ProductPrice | No inbound FKs |
| Promotion | `PromotionItem.promotion_id` — cascade (we delete items first manually) |

---

## Soft Delete (Deactivation)

Deactivated entities are marked `is_active = false` and remain in the database. They are excluded from operational queries but historical data is preserved.

**Products:** Deactivation also carries through to ensure the default variant record is preserved via `ensure_default_variant_for_product()`.

**Warehouses:** Deactivation prevents new stock operations but does not affect existing balances or movement history.

**InventoryLots:** Deactivation prevents the lot from being selected for new movements while preserving all historical data.

---

## Implementation Notes

### Backend

- All DELETE endpoints reuse `_UPDATE` permission keys (no separate `_DELETE` permissions exist).
- Dependency checks use count queries injected from `ProductsRepository` and `ProductVariantsRepository` into the respective services.
- Price list cascade: `ProductPricesRepository.delete_by_price_list_in_business()` is called before removing the list itself.
- Promotion cascade: `PromotionItemRepository.delete({ promotion_id })` is called inside `PromotionsRepository.remove()`.

### Frontend

- Each delete/deactivate action shows an `AlertDialog` confirmation before executing.
- Hard deletes use `toast.success(t("common.delete_success"))` on success.
- Soft deletes use `toast.success(t("common.update_success"))` on success.
- Backend error codes (`BRAND_IN_USE`, `CATEGORY_HAS_CHILDREN`, etc.) are translated via `inventory.error.*` keys and surfaced via `presentBackendErrorToast`.
- For price-lists and products with the `is_default` flag, the delete action is hidden or disabled in the column renderer.
