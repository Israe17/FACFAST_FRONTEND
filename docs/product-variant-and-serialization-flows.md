# Product Variants & Serialization Flows

## 1. Diagnostic: Problems Found

### 1.1 Stale Variants After Attribute Changes

**Problem:** When a user changed attributes and regenerated variants, old variants from previous
attribute combinations persisted in the table alongside new ones.

**Root Cause:** The backend `generate_variants()` method is additive-only — it creates new
combinations but never removes existing ones. This is by design (safe for operational data),
but the frontend provided no way to:
- Distinguish generated variants from manual ones
- See which attribute values each variant was created from
- Deactivate/remove stale variants

**Risk:** Users could accumulate dozens of incorrect variants with no cleanup mechanism, leading
to confusion in operational flows (movements, stock, pricing).

### 1.2 No Delete/Deactivate Capability

**Problem:** The variant table only had an "Edit" action. There was no way to remove or
deactivate a variant once created.

**Root Cause:** The backend had a `deactivate_variant()` service method, but it was never
exposed through any controller endpoint. The frontend had no API call or mutation for it.

### 1.3 No Visual Differentiation

**Problem:** All variants looked identical in the table — no way to tell if a variant was:
- Auto-generated from attributes
- Manually created
- A default variant
- Active or inactive

### 1.4 Silent Duplicate Prevention

**Problem:** The backend prevented duplicate attribute combinations, but the user received no
feedback about what happened during generation. If all combinations already existed, the
generation appeared to do nothing.

---

## 2. Correct Variant Flow

### 2.1 Create Attributes

1. Navigate to Product Detail > Variants Section
2. Click "Define Attributes"
3. Add attribute names (e.g., "Color", "Size")
4. Add values for each attribute (e.g., Red, Blue for Color)
5. Click "Save Attributes"

**Rules:**
- Attributes with empty names or no values are silently filtered
- Duplicate values within an attribute are prevented (case-insensitive)
- Attribute names are unique per product (enforced by backend)

### 2.2 Generate Variants

1. After saving attributes, click "Generate Variants"
2. If variants already exist, a confirmation dialog appears explaining the behavior
3. Backend creates Cartesian product of all attribute value combinations
4. Only NEW combinations are created (existing ones are skipped)
5. Each generated variant inherits product settings (tax profile, units, tracking flags)

**SKU Generation:**
- Base: `{product_sku}-{first 4 chars of each value}`
- Example: `IPHONE-BLAC-128G` for "Black" + "128GB"
- If SKU exists, timestamp is appended: `IPHONE-BLAC-128G-1711234567`

### 2.3 Edit Attributes

1. Click "Edit Attributes" to modify existing attributes
2. Add/remove values, rename attributes, add new attributes
3. Click "Save Attributes"

**What happens to existing variants:**
- Nothing. Attribute changes do NOT modify or delete existing variants.
- The attribute-variant link is preserved via a ManyToMany join table.
- To create variants for new attribute values, click "Generate Variants" again.

### 2.4 Regenerate After Attribute Changes

1. After editing attributes, click "Generate Variants"
2. Confirmation dialog explains: "New combinations will be created. Existing variants are not affected."
3. Only missing combinations are generated

**Example:**
- Original attributes: Color (Red, Blue), Size (S, M) → 4 variants
- Add "Green" to Color → Click Generate → Only 2 new variants (Green-S, Green-M)
- Old variants remain untouched

### 2.5 Deactivate a Variant

1. Click the actions menu (three dots) on a variant row
2. Select "Deactivate"
3. Confirmation dialog appears explaining the consequences
4. Variant is set to `is_active = false`

**Rules:**
- Cannot deactivate the default variant
- Cannot deactivate the last active variant (at least one must remain active)
- Deactivated variants appear with strikethrough text and "Inactive" badge
- Historical data (movements, stock, lots) is NOT affected

### 2.6 Prevent Duplicates

Backend prevents duplicates at two levels:
1. **Attribute combination:** A variant with the same set of attribute values cannot be created twice
2. **SKU uniqueness:** SKUs are unique per business (not per product)

Frontend now shows attribute value badges on each generated variant, making it visually clear
which combination each variant represents.

### 2.7 Manual vs Default vs Generated

| Type | Visual Indicator | Behavior |
|------|-----------------|----------|
| **Default** | "Default variant" badge | Auto-created for every product. For simple products, syncs with product settings. Cannot be deactivated. |
| **Generated** | Attribute value badges below name | Created by "Generate Variants" from attribute combinations. Can be deactivated. |
| **Manual** | No attribute badges | Created via "Create Variant" button. Can be deactivated. |

---

## 3. Serialization Flow

### 3.1 Conceptual Model

```
Product = commercial master (iPhone 15)
  └── ProductVariant = operational unit (iPhone 15 Black 128GB)
       └── ProductSerial = physical unit (IMEI: 123456789012345)
```

- **Variant != Serial**
- **Variant** = type/configuration (color, size, capacity)
- **Serial** = individual physical unit with unique identifier

### 3.2 Serializable Product (No Variants)

**Examples:** Unique jewelry, high-value tools, single-model equipment

**Setup:**
1. Create product with `has_variants = false`
2. Default variant is auto-created
3. Edit default variant → Enable `track_serials = true`
4. Each unit received into inventory gets a serial number

**User Experience:** The user works with the product directly. The system tracks serials on the
default variant behind the scenes. The UX feels like "one product with serial numbers."

### 3.3 Serializable Product WITH Variants

**Examples:** Phones, laptops, tablets, consoles, appliances

**Setup:**
1. Create product with `has_variants = true`
2. Define attributes (Model, Color, Storage)
3. Generate variants
4. For each variant that needs serial tracking: Edit variant → Enable `track_serials = true`

**User Experience:** The user selects the variant first, then manages serials within that variant.

**Example flow for a phone store:**
- Product: "iPhone 15"
- Variants: Black-128GB, Black-256GB, White-128GB, White-256GB
- Each variant has `track_serials = true`
- When receiving inventory: select variant → enter IMEI for each unit

### 3.4 Non-Serializable Products

**Examples:** Food, commodities, generic hardware, bulk items

**Setup:**
1. Create product (simple or with variants)
2. Leave `track_serials = false` on all variants
3. Track by quantity only

### 3.5 Tracking Dependencies

```
track_inventory = true  (required for everything below)
  ├── track_lots = true  (optional, enables lot tracking)
  │   └── track_expiration = true  (optional, requires lots)
  └── track_serials = true  (optional, enables serial/IMEI tracking)
```

All tracking flags live at the **variant level**, not the product level.

---

## 4. Functional Rules

### 4.1 When Can a Variant Be Deactivated?

- It is NOT the default variant
- It is NOT the last active variant for the product
- It CAN have historical data (movements, stock) — deactivation is soft, not deletion

### 4.2 When Can a Variant NOT Be Deactivated?

- If it's the default variant
- If it's the only active variant remaining

### 4.3 When Can Variants Be Regenerated?

- Anytime, as long as attributes are defined
- Generation is always safe: it only adds new combinations
- A confirmation dialog reminds the user of this behavior

### 4.4 Variants with Operational Usage

Variants that have stock, movements, or lots associated:
- Cannot be deleted (no hard delete exists in the system)
- Can be deactivated (set `is_active = false`)
- Deactivated variants cannot be selected in new operations
- Historical data remains intact

### 4.5 Unique Jewelry / Single Pieces

- Create as simple product (`has_variants = false`)
- Enable `track_serials` on the default variant
- Each piece gets a unique serial number
- Stock is typically 0 or 1 per serial

### 4.6 Serializable Electronics / Appliances

- Create with `has_variants = true`
- Define attributes: Model, Color, Capacity, etc.
- Generate variants for all combinations
- Enable `track_serials` on each variant
- Each physical unit (phone, laptop, washer) gets an IMEI/serial

---

## 5. Business Scenarios

### 5.1 Food / Raw Materials

- **Product type:** Simple product or variants by presentation
- **Variants:** By weight (1kg, 5kg, 25kg sack), by unit (piece, dozen)
- **Serialization:** Not applicable
- **Lot tracking:** Yes, for expiration dates
- **Example:** Rice → Variants: 1kg bag, 5kg bag, 25kg sack

### 5.2 Liquids

- **Product type:** Variants by container
- **Variants:** By volume (500ml, 1L, gallon)
- **Serialization:** Not applicable
- **Lot tracking:** Optional, for production dates
- **Example:** Cooking oil → Variants: 500ml bottle, 1L bottle, 5L canister

### 5.3 Electronics (Phones, Laptops, Tablets)

- **Product type:** Variants + serials
- **Variants:** By model, color, storage capacity
- **Serialization:** Yes (IMEI, serial number)
- **Lot tracking:** Optional
- **Warranty:** Per variant or per serial
- **Example:** iPhone 15 → Variants: Black-128GB, White-256GB → Each unit has IMEI

### 5.4 Appliances (Washers, Fridges, TVs)

- **Product type:** Variants + serials
- **Variants:** By color, model, capacity
- **Serialization:** Yes (serial number)
- **Warranty:** Per variant
- **Example:** Samsung Washer → Variants: White-12kg, Gray-15kg → Each unit has serial

### 5.5 Hardware / Tools

- **Simple tools:** Product without variants, track by quantity
- **Premium tools:** Product without variants + serial tracking
- **Variable tools:** Product with variants (size, type) + optional serial
- **Example:** Bosch Drill → Simple product, `track_serials = true`

### 5.6 Jewelry / Unique Objects

- **Product type:** Simple product + serial tracking
- **Variants:** Usually not needed (each piece is unique)
- **Serialization:** Yes (unique ID per piece)
- **Stock:** Typically 0 or 1 per serial
- **Example:** Gold Ring → Simple product, `track_serials = true`, stock per serial

---

## 6. Changes Implemented

### Backend

| File | Change |
|------|--------|
| `controllers/product-variants.controller.ts` | Added `DELETE /:id/variants/:variantId` endpoint for deactivation |
| `services/product-variants.service.ts` | Added `attribute_values` to `serialize_variant()` output |
| `repositories/product-variants.repository.ts` | Added `attribute_values: true` to relations in list and detail queries |
| `entities/warehouse-stock.entity.ts` | Updated unique index to include `product_variant_id` |
| `services/inventory-movements.service.ts` | Fixed `sync_legacy_warehouse_stock()` to set `product_variant_id` |
| `repositories/warehouse-stock.repository.ts` | Added `product_variant: true` to all query relations |

### Frontend

| File | Change |
|------|--------|
| `components/product-variants-section.tsx` | Added deactivate action with confirmation dialog, attribute badges, tracking badges, inactive styling, memoized columns |
| `components/variant-attributes-manager.tsx` | Added generation confirmation dialog, case-insensitive duplicate check for values |
| `schemas.ts` | Added `variantAttributeValueRefSchema`, `attribute_values` to `productVariantSchema` |
| `api.ts` | Added `deactivateProductVariant()` API function |
| `queries.ts` | Added `useDeactivateProductVariantMutation()` hook |
| `shared/i18n/translations.ts` | Added 14 new translation keys (ES + EN) for deactivation, generation confirmation, tracking flags |

---

## 7. Edge Cases & Next Steps

### 7.1 Backend Dependencies (Future)

- **Hard delete:** Currently only soft deactivation. Consider adding hard delete for variants
  with zero operational usage (no stock, movements, lots, prices, serials).
- **Bulk operations:** Consider "Deactivate all unused variants" endpoint for cleanup.
- **Attribute-variant orphan detection:** API to identify variants whose attribute combinations
  no longer match current attribute definitions.

### 7.2 API Contracts to Review

- `generate_variants` currently returns only newly created variants. Consider returning all
  variants (including existing) so frontend can show a complete diff.
- Consider adding a `source` field to ProductVariant (`manual`, `generated`, `default`) for
  clearer differentiation.

### 7.3 Future Validations

- Prevent generating variants if the Cartesian product would exceed a configurable limit
  (e.g., 100 combinations).
- Add SKU pattern validation (configurable per business).
- Add barcode format validation (EAN-13, UPC-A, etc.).

### 7.4 UX Improvements (Future)

- Bulk edit: Select multiple variants and update settings (e.g., enable serial tracking on all).
- Variant comparison view: Side-by-side comparison of variant settings.
- Stock overview per variant in the variants table (inline mini-stock column).
- Price overview per variant in the variants table.
- Filter variants by status (active/inactive) in the table.
