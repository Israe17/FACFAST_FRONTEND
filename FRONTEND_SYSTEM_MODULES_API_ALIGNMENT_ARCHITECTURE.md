# FRONTEND SYSTEM MODULES API ALIGNMENT ARCHITECTURE

## Goal

Align the frontend shared architecture with the real backend contract instead of keeping compatibility layers built for partial or older responses.

This document focuses on the architectural decisions already applied in frontend.

## Transport

- frontend client base URL remains `/api`
- authentication is cookie-based
- Axios uses `withCredentials: true`
- no bearer tokens are stored in localStorage

## Session Contract

The frontend session model is now aligned to `auth/me`:

- `business_id`
- `active_business_language`
- `branch_ids`
- `user_type`
- `is_platform_admin`
- `acting_business_id`
- `acting_branch_id`
- `mode`

`useSession()` still exposes convenience booleans like:

- `isPlatformMode`
- `isTenantMode`
- `isTenantContextMode`
- `isPlatformAdmin`
- `activeBusinessId`

But the underlying `user` object mirrors the backend naming.

## Language Resolution

Frontend success-message i18n now uses the backend session contract directly:

- primary source: `auth/me.active_business_language`
- no `business/current` request is required only to translate a toast
- platform onboarding and similar pre-session flows can pass a business language explicitly to `resolveAppLanguage(...)`

## Error Contract

Frontend treats backend as the canonical source for human-readable error text:

- banner text uses `response.message`
- field errors use `details[].message` or `details.message`
- `code` and `messageKey` are for logic, not for replacing text

The shared parser no longer does deep heuristic traversal for old wrapped payloads. It trusts the standardized backend envelope and only keeps a small amount of tolerance for direct transport wrappers.

## DTO Strategy

Frontend should prefer exact DTO field names from backend for forms and mutations.

Already aligned in this pass:

- `auth`
- `platform context`
- `users`
- `contacts`
- `business/current`
- `roles`
- `branches`
- `inventory catalogs`
- `platform business consumers` that reuse those serializers

Examples:

- `max_sale_discount`, not `maxSaleDiscount`
- `branch_ids`, not `branchIds`
- `active_business_language`, not `language`
- `business_id`, `branch_id` in platform context payloads

When the form uses the same field names as the DTO, a local `fieldNameMap` is unnecessary.

## Form Module Pattern

Form-heavy modules should follow one small pattern:

- `schemas.ts` for validation
- `types.ts` for aligned types
- `api.ts` for serialization and parsing
- `queries.ts` for React Query
- `form-values.ts` only when create/edit/reset/mapping logic is repeated
- dialogs and form components for UI only

This is already being used successfully in:

- `branches`
- `roles`

Reference:

- [FRONTEND_FORM_MODULE_PATTERN_ARCHITECTURE.md](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/FRONTEND_FORM_MODULE_PATTERN_ARCHITECTURE.md)

## Tenant Context

Platform context switching keeps using:

- `POST /platform/enter-business-context`
- `POST /platform/clear-business-context`
- `GET /auth/me`

The frontend now relies on the refreshed session for:

- `mode`
- `acting_business_id`
- `acting_branch_id`
- `active_business_language`

This removes the need for extra fetches just to derive language or context labels.

## Users Module Alignment

The users shared layer is now aligned to the documented contract:

- `status` uses backend values: `active | inactive | suspended | deleted`
- `PATCH /users/:id/status` sends the exact backend body
- `PATCH /users/:id/password` sends `{ password }`
- create/update mutations send snake_case only
- the user schema no longer normalizes legacy camelCase aliases

## Roles Module Alignment

The RBAC frontend layer is now aligned to the documented contract:

- role DTOs use `code`, `name`, `role_key`
- role serializers use `code`, `role_key`, `is_system`, `created_at`, `updated_at`
- permission assignment uses `permission_ids`
- role and permission tables no longer depend on legacy `description`, `permissionCount` or `userCount`
- role forms now use the shared backend form-error architecture instead of ad hoc error handling

## Branches Module Alignment

The branches frontend layer is now aligned to the documented contract:

- branch serializers use `snake_case` fields like `branch_number`, `created_at`, `updated_at`
- terminal serializers use `snake_case` fields like `terminal_number`, `created_at`, `updated_at`
- UI status badges are derived from backend `is_active`, not from legacy synthetic `status`
- create/update branch and terminal mutations return the serialized resource
- edit branch forms no longer expect raw secret values from detail responses
- backend secret flags like `has_crypto_key`, `has_hacienda_password` and `has_mail_key` are treated as flags only

## Businesses Module Alignment

`businesses/current` now uses the exact backend serializer and DTO names:

- `currency_code`, `legal_name`, `logo_url`, `created_at`, `updated_at`
- `PATCH /businesses/current` returns the updated serialized business and the frontend parses it directly
- the page and form already use the shared backend form-error architecture

## Inventory Module Alignment

The inventory frontend is now started as a real module inside the tenant shell.

Current implemented scope:

- route: `/inventory`
- navigation entry in sidebar and dashboard
- catalogs:
  - `brands`
  - `measurement-units`
  - `product-categories`
  - `tax-profiles`
  - `warranty-profiles`
- products, pricing and promotions:
  - `products`
  - `price-lists`
  - `product-prices`
  - `promotions`
- warehouses, stock, lots and movements:
  - `warehouses`
  - `warehouse-locations`
  - `warehouse-stock`
  - `inventory-lots`
  - `inventory-movements`

Current architectural rules applied:

- exact backend DTO field names
- shared error handling with backend `message` as canonical text
- `common.*` success messages for generic create/update flows
- per-entity `form-values.ts` defaults and serializer-to-form mapping
- React Query keys grouped under `inventoryKeys`
- tenant-aware cache cleanup through `session-state.ts`
- movement flows respect backend heterogeneity instead of forcing a fake uniform response:
  - list consumes ledger rows
  - adjustment consumes legacy single movement serializer
  - transfer consumes header plus compact lines
  - cancel consumes summary plus compensating movement

Current intentional limitation:

- the frontend still treats `product` as the master catalog and `product_variant` as the stock-facing read model
- there is no separate variant maintenance UI yet
- warehouse `purpose` is parsed and rendered as read-only because current DTOs do not expose it for writes

## What Is Intentionally Still Shared

These pieces remain architectural and reusable:

- `shared/lib/backend-error-parser.ts`
- `shared/lib/form-error-mapper.ts`
- `shared/lib/error-presentation.ts`
- `shared/hooks/use-backend-form-errors.ts`
- `shared/i18n/*`
- `shared/lib/session-state.ts`

They are not tied to one module and should be reused by future modules like branches, products, inventory, purchases and sales.

## Next Recommended Alignment Work

The next alignment work should stay on the same rule, now applied to future modules such as purchases, sales and advanced inventory phases:

- exact DTO names first
- backend message text first
- one shared parser
- one shared language source
