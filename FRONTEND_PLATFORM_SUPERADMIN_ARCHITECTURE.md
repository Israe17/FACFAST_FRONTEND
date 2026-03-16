# Frontend Platform Superadmin Architecture

## Separation

The frontend keeps two explicit route groups, but one shared FACFAST admin shell:

- Tenant panel routes under `app/(dashboard)`.
- Platform routes under `app/(platform)/superadmin`.

Both route groups render the same sidebar, header and shell styling. Platform is expressed as an additional context layer, not as a second product.

## Session Model

`/api/auth/me` is normalized into a single session model with:

- `businessId`
- `branchIds`
- `userType`
- `isPlatformAdmin`

`isPlatformAdmin` is the only frontend signal used to unlock platform UI.

## Tenant vs Platform Context

Two contexts are kept separate:

- Session business: `user.businessId`
- Platform active business: `activeBusinessId`

`activeBusinessId` is never written back into auth state and never replaces `user.businessId`.

## Route Structure

- Tenant routes:
  - `/`
  - `/business-settings`
  - `/users`
  - `/roles`
  - `/branches`
  - `/contacts`
- Platform routes:
  - `/superadmin/businesses`
  - `/superadmin/businesses/new`
  - `/superadmin/businesses/[id]`

The platform group has its own protected route group, but it reuses the same visual shell through conditional navigation sections.

## Business Switcher

`use-active-business` persists `activeBusinessId` locally and validates it against the currently loaded global business list.

Rules:

- Tenant users never see it.
- Platform admins see it inside the shared shell when they are on platform routes.
- Changing `activeBusinessId` refreshes dependent platform queries through TanStack Query keys.

## Branch Switcher Relationship

The branch switcher supports two modes:

- Tenant mode:
  - uses `session.branchIds`
  - persists tenant branch context independently
- Platform mode:
  - requires `activeBusinessId`
  - loads branches from `GET /platform/businesses/:id/branches`
  - persists platform branch context separately from tenant branch context

This prevents collisions between tenant branch selection and platform inspection state.

## Platform Businesses Feature

`features/platform-businesses` owns:

- global businesses list
- business detail
- platform onboarding mutation
- platform business switcher
- onboarding form sections

It reuses shared frontend primitives and the business domain validators where possible instead of duplicating request clients or form infrastructure.

## Onboarding

Platform onboarding uses only:

- `POST /api/platform/businesses/onboarding`

The form is split into:

- Empresa
- Owner
- Sucursal inicial
- Terminal inicial opcional

On success it shows toast feedback and returns the operator to platform list/detail flow. No impersonation and no auto-login are introduced.

## UI Security

UI access rules:

- Tenant shell: regular authenticated user
- Platform shell: authenticated user with `isPlatformAdmin = true`

Server layouts protect both route groups. Client navigation and switchers hide platform-only affordances unless `isPlatformAdmin` is true.

## Unified UX

The shell stays visually unified:

- same FACFAST branding
- same sidebar component
- same header component
- same breadcrumbs
- same cards, tables and shared states

Platform admins get additional navigation items and header badges such as:

- `Modo plataforma`
- session business
- active platform business
- active branch context

## Out of Scope

This phase does not implement:

- impersonation
- tenant session switching
- SaaS billing
- subscriptions
- global analytics
- non-platform operational modules
