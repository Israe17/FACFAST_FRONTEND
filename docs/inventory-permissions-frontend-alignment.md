# Inventory Permissions Frontend Alignment

## Summary

The frontend now treats the backend permission catalog from `GET /permissions` as the only source of truth for inventory permissions.

## What Was Correct

- Roles already loaded the catalog from `GET /permissions`.
- Permission rows already preserved unknown backend permissions.
- Inventory page guards already used exact string keys through `usePermissions()`.

## What Was Misaligned

- Variant, serial, and variant-attribute UI still gated actions with `products.*`.
- Movement cancel UI still used `inventory_movements.adjust`.
- Several inventory tables exposed delete actions under `*.update`.
- Inventory shell access did not include the new inventory view modules.

## What Changed

- Inventory shell access now includes:
  - `product_variants.view`
  - `variant_attributes.view`
  - `product_serials.view`
- Product variant UI now uses:
  - `product_variants.view`
  - `product_variants.create`
  - `product_variants.update`
  - `product_variants.delete`
- Variant attribute UI now uses:
  - `variant_attributes.view`
  - `variant_attributes.configure`
  - `variant_attributes.generate`
- Product serial UI now uses:
  - `product_serials.view`
  - `product_serials.create`
  - `product_serials.update`
- Movement UI now uses:
  - `inventory_movements.view`
  - `inventory_movements.adjust`
  - `inventory_movements.transfer`
  - `inventory_movements.cancel`
- Delete actions in inventory catalogs now respect explicit `*.delete` permissions instead of piggybacking on `*.update`.

## Variant Delete UX

- Deactivate variant: `DELETE /products/:id/variants/:variantId`
- Permanent delete: `DELETE /products/:id/variants/:variantId/permanent`
- Both are gated by `product_variants.delete`
- The frontend uses `variant.lifecycle` to decide whether to show deactivate, permanent delete, or reactivate

## Role UI

- The role assignment dialog still groups permissions by backend `module`
- It now renders the backend `action` as the primary label
- The full backend `key` remains visible as the stable identifier

## Operational Note

Variant, serial, and attribute tools are still nested under product detail pages in the current frontend architecture, so product-detail navigation still depends on product visibility routes already present in the app. Inside those screens, action visibility now follows the granular backend permissions exactly.
