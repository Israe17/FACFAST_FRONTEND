# FRONTEND FORM MODULE PATTERN ARCHITECTURE

## Goal

Define a small and repeatable pattern for form-based frontend modules so new work stays aligned with the backend contract without duplicating mapping, defaults, validation or error logic.

This pattern is intentionally lightweight.

- reusable, but not abstract for abstraction's sake
- consistent, but not rigid
- aligned with backend DTOs and serializers

## Core Rule

Each module should keep responsibilities separated:

- `schemas.ts`: frontend validation that mirrors backend DTO rules
- `types.ts`: inferred types from schemas or backend-aligned response shapes
- `api.ts`: request/response parsing and payload serialization
- `queries.ts`: React Query integration, cache invalidation and mutation side effects
- `form-values.ts`: shared form defaults and `entity -> form` mapping when duplication exists
- `components/*dialog.tsx` or `components/*form.tsx`: UI only

## When To Create `form-values.ts`

Create `form-values.ts` only when the module has repeated form state logic such as:

- the same default values in create and edit dialogs
- the same `entity -> form` mapping in multiple places
- the same payload cleanup in multiple places
- the same permission-based field stripping in multiple places

Do not create it for a trivial single-form module with no duplication yet.

## What Goes In `form-values.ts`

Good candidates:

- `emptyCreateEntityFormValues`
- `getEntityFormValues(entity)`
- `stripSensitiveEntityFields(values, permissions)`
- `getEntitySecretState(entity)`

Bad candidates:

- API calls
- React hooks
- toast logic
- schema definitions
- React components

## Why This Pattern Exists

Without a shared form-values layer, the same module often duplicates:

- create defaults
- edit defaults
- reset behavior
- entity hydration for forms
- special payload cleanup

That duplication causes drift.

Typical failure mode:

- create dialog sends one shape
- edit dialog sends a slightly different shape
- one dialog strips a sensitive field
- the other forgets

The purpose of this pattern is to keep one source of truth per module, not to create a global form framework.

## Current Good Examples

### Branches

[features/branches/form-values.ts](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/features/branches/form-values.ts) centralizes:

- empty branch form values
- branch serializer -> form mapping
- empty terminal form values
- terminal serializer -> form mapping
- sensitive branch field stripping
- backend secret flags for edit UX

Used by:

- [create-branch-dialog.tsx](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/features/branches/components/create-branch-dialog.tsx)
- [edit-branch-dialog.tsx](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/features/branches/components/edit-branch-dialog.tsx)
- [create-terminal-dialog.tsx](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/features/branches/components/create-terminal-dialog.tsx)
- [edit-terminal-dialog.tsx](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/features/branches/components/edit-terminal-dialog.tsx)

This is a strong fit because branches have:

- create and edit flows
- terminal create and edit flows
- permission-sensitive fields
- backend secret flags

### Roles

[features/roles/form-values.ts](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/features/roles/form-values.ts) centralizes:

- empty role form values
- role serializer -> form mapping

This is a lighter version of the same pattern and is a good fit because create and edit share the same fields.

## Recommended Pattern For Future Modules

### Users

Worth applying because users already have:

- create dialog
- edit dialog
- password update flow
- role assignment flow
- branch assignment flow

The reusable part should focus on:

- create/edit defaults
- user serializer -> edit form mapping
- unique numeric array normalization for `role_ids` and `branch_ids`

### Contacts

Worth applying because contacts already have:

- create dialog
- edit dialog
- repeated address/contact defaults
- backend-aligned optional fields

The reusable part should focus on:

- contact create defaults
- contact serializer -> edit form mapping
- optional field normalization

### Businesses Current

Useful if the business settings page keeps growing, especially if multiple tabs or sections start reusing the same defaults and serializer mapping.

### Inventory

Recommended from the start because inventory families usually have:

- many forms
- nested payloads
- repeated numeric/date normalization
- more cross-field dependencies

## Shared Rules Across All Modules

### DTO First

Form field names should match backend DTO field names whenever possible.

Examples:

- `branch_number`
- `role_key`
- `branch_ids`
- `max_sale_discount`

Avoid camelCase-only form models when backend already uses `snake_case`.

### Backend Errors Stay Canonical

Modules should keep using the shared backend error flow:

- [backend-error-parser.ts](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/shared/lib/backend-error-parser.ts)
- [form-error-mapper.ts](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/shared/lib/form-error-mapper.ts)
- [error-presentation.ts](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/shared/lib/error-presentation.ts)
- [use-backend-form-errors.ts](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/shared/hooks/use-backend-form-errors.ts)

Do not create module-specific human-message mappers if backend already sends `message`.

### Validation Stays In Schemas

Regex, min lengths, enum rules and cross-field validation should stay in `schemas.ts`, not in dialogs.

Shared patterns should live in:

- [validation.ts](/c:/Users/cente/Documents/facfast/FACFAST_FRONTEND/frontend/shared/lib/validation.ts)

### UI Components Stay Dumb

Dialogs and form components should mostly do this:

- initialize form
- reset on open/close
- call mutation
- delegate backend errors to shared helpers
- render fields

They should not own business mapping logic when that mapping is reused elsewhere.

## Anti-Patterns To Avoid

- a global mega helper that tries to build every form in the system
- form components doing API serialization directly
- repeated inline `defaultValues` for the same entity in multiple dialogs
- repeated inline `entity -> form` mapping in multiple dialogs
- module-specific error text rebuilding when backend already sends translated text

## Decision Rule

Use this quick test:

- if the same form state logic appears twice, extract it to `form-values.ts`
- if it appears once, keep it local
- if the extraction would only save 3 trivial lines, do not extract it

The goal is consistency and maintainability, not abstraction for its own sake.
