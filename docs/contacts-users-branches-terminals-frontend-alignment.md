# Contacts, Users, Branches And Terminals Frontend Alignment

## 1. Executive summary

The frontend was aligned to the latest backend contract for:

- contacts
- users
- branches
- terminals
- roles and permission visibility for these modules

Main result:

- explicit delete permissions are now honored in UI actions
- contacts, branches, and terminals use `PATCH` for deactivate/reactivate and `DELETE` for hard delete
- users use `PATCH /users/:id/status` for lifecycle changes and `DELETE /users/:id` only for hard delete
- business errors are now translated by `code` or `messageKey`, not by unstable backend `message`
- invalidation now refreshes the right entity, list, selector, and current session state when needed

## 2. What was misaligned before

- `contacts`, `branches`, and `terminals` had edit/update flows but no explicit hard delete integration in the UI
- `users` had password, roles, branches, and a simple active/inactive toggle, but not a real status-management dialog aligned to `PATCH /users/:id/status`
- row actions still assumed a smaller permission surface than the backend now exposes
- delete visibility was not explicitly aligned to:
  - `contacts.delete`
  - `users.delete`
  - `branches.delete`
  - `branches.delete_terminal`
- frontend error translation was biased toward `inventory.error.*` and did not resolve generic module errors by `code`
- branch delete did not surface dependency-aware feedback from `BRANCH_DELETE_FORBIDDEN`

## 3. What was corrected

### Contacts

- Added hard delete support through `DELETE /contacts/:id`
- Added explicit row actions:
  - edit
  - deactivate
  - reactivate
  - permanent delete
- Deactivate/reactivate uses `PATCH /contacts/:id` with `is_active`
- Permanent delete uses `contacts.delete`
- All destructive actions now require confirmation
- `CONTACT_DELETE_FORBIDDEN` now shows a dependency-aware message built from backend `details.dependencies`

### Users

- Added hard delete support through `DELETE /users/:id`
- Replaced the old binary status toggle with a dedicated status dialog using:
  - `status`
  - `allow_login`
- Status lifecycle now uses `PATCH /users/:id/status`
- Hard delete uses `users.delete`
- Delete is hidden for:
  - authenticated current user
  - platform admin users
  - the last known owner in the currently loaded dataset
- Assign roles invalidates the role list in addition to user queries
- Mutations affecting the current authenticated user invalidate the auth session query
- backend delete blockers remain the authority, including inventory movement history and serial-event history

### Branches

- Added hard delete support through `DELETE /branches/:id`
- Added explicit row actions:
  - edit
  - deactivate
  - reactivate
  - permanent delete
- Deactivate/reactivate uses `PATCH /branches/:id` with `is_active`
- Sensitive configuration remains gated by `branches.configure`
- `BRANCH_DELETE_FORBIDDEN` now shows a dependency-aware message built from backend `details.dependencies`

### Terminals

- Added hard delete support through `DELETE /terminals/:id`
- Added explicit row actions:
  - edit
  - deactivate
  - reactivate
  - permanent delete
- Deactivate/reactivate uses `PATCH /terminals/:id` with `is_active`

## 4. Permission mapping used by the frontend

### Contacts

- Page access: `contacts.view`
- Create: `contacts.create`
- Edit: `contacts.update`
- Deactivate/reactivate: `contacts.update`
- Permanent delete: `contacts.delete`

### Users

- Page access: `users.view`
- Create: `users.create`
- Edit profile: `users.update`
- Change status: `users.change_status`
- Change password: `users.change_password`
- Assign roles: `users.assign_roles`
- Assign branches: `users.assign_branches`
- Permanent delete: `users.delete`

### Branches

- Page access: `branches.view`
- Create branch: `branches.create`
- Edit branch: `branches.update`
- Deactivate/reactivate branch: `branches.update`
- Edit sensitive config fields: `branches.update` + `branches.configure`
- Permanent delete branch: `branches.delete`
- Create terminal: `branches.create_terminal`

### Terminals

- Edit terminal: `branches.update_terminal`
- Deactivate/reactivate terminal: `branches.update_terminal`
- Permanent delete terminal: `branches.delete_terminal`

## 5. Endpoints now used by the frontend

### Contacts

- `GET /contacts`
- `GET /contacts/:id`
- `GET /contacts/lookup/:identification`
- `POST /contacts`
- `PATCH /contacts/:id`
- `DELETE /contacts/:id`

Important delete caveat:

- hard delete is no longer assumed to be always available
- backend may block delete when the contact has history in:
  - `inventory_lots`
  - `serial_events`

### Users

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `PATCH /users/:id/status`
- `PATCH /users/:id/password`
- `PUT /users/:id/roles`
- `PUT /users/:id/branches`
- `GET /users/:id/effective-permissions`
- `DELETE /users/:id`

### Branches

- `GET /branches`
- `GET /branches/:id`
- `POST /branches`
- `PATCH /branches/:id`
- `DELETE /branches/:id`
- `POST /branches/:id/terminals`

### Terminals

- `PATCH /terminals/:id`
- `DELETE /terminals/:id`

## 6. Lifecycle behavior in UI

These modules still do **not** expose inventory-style `lifecycle`.

The frontend therefore uses:

- explicit permission keys
- current state fields
- backend execution errors

### Contacts

- active state source: `is_active`
- deactivate/reactivate: `PATCH`
- hard delete: `DELETE`

### Users

- lifecycle source: `status` and `allow_login`
- non-destructive lifecycle: `PATCH /users/:id/status`
- hard delete: `DELETE /users/:id`
- delete is not presented as equivalent to deactivate

### Branches

- active state source: `is_active`
- deactivate/reactivate: `PATCH`
- hard delete: `DELETE`

### Terminals

- active state source: `is_active`
- deactivate/reactivate: `PATCH`
- hard delete: `DELETE`

## 7. Invalidations configured

### Contacts

After create, update, deactivate, reactivate, or delete:

- invalidate `contacts`
- invalidate `contact(id)` via the shared `contacts` tree
- invalidate lookup queries
- invalidate contact-backed supplier selectors used by inventory lots through the same contact query tree

### Users

After create, update, status change, password change, role assignment, branch assignment, or delete:

- invalidate `users`
- invalidate `user(id)`
- invalidate `user-effective-permissions(id)`
- invalidate `roles` after role assignment
- invalidate current auth session if the affected user is the authenticated one

### Branches

After create, update, deactivate, reactivate, terminal create, terminal update, branch delete, or terminal delete:

- invalidate `branches`
- invalidate `branch(id)`
- invalidate branch selectors reused across the app
- invalidate branch-assignment queries used in user management

## 8. Error mapping added

The shared backend error presentation now resolves:

- `messageKey`
- `error.{CODE}`
- existing `inventory.error.{CODE}` compatibility

Mapped contact/user/branch/terminal errors include:

- `CONTACT_NOT_FOUND`
- `CONTACT_CODE_DUPLICATE`
- `CONTACT_DELETE_FORBIDDEN`
- `CONTACT_IDENTIFICATION_DUPLICATE`
- `CONTACT_LOOKUP_MULTIPLE`
- `USER_NOT_FOUND`
- `USER_EMAIL_DUPLICATE`
- `USER_INVALID_ROLES_FOR_BUSINESS`
- `USER_INVALID_BRANCHES_FOR_BUSINESS`
- `USER_SELF_DELETE_FORBIDDEN`
- `USER_PLATFORM_ADMIN_DELETE_FORBIDDEN`
- `USER_LAST_OWNER_DELETE_FORBIDDEN`
- `USER_DELETE_FORBIDDEN`
- `USER_OWNER_ASSIGNMENT_FORBIDDEN`
- `USER_OWNER_MANAGEMENT_FORBIDDEN`
- `USER_SYSTEM_MANAGEMENT_FORBIDDEN`
- `USER_CROSS_BUSINESS_MANAGEMENT_FORBIDDEN`
- `BRANCH_NOT_FOUND`
- `BRANCH_ACCESS_FORBIDDEN`
- `BRANCH_MANAGE_SCOPE_FORBIDDEN`
- `BRANCH_CONFIGURATION_PERMISSION_REQUIRED`
- `BRANCH_DELETE_FORBIDDEN`
- `TERMINAL_NOT_FOUND`

Special handling:

- `CONTACT_DELETE_FORBIDDEN` reads `details.dependencies` and presents a dependency summary to the user
- `BRANCH_DELETE_FORBIDDEN` reads `details.dependencies` and presents a dependency summary to the user

## 9. Roles and permission catalog alignment

The role UI already consumes `GET /permissions` dynamically, so the new explicit permissions are now shown automatically as long as the backend seed has run and the backend was restarted.

This includes explicit visibility for:

- `contacts.delete`
- `branches.delete`
- `branches.delete_terminal`

Unknown future permission modules and actions are still preserved by the UI.

## 10. Files modified

- `shared/lib/error-presentation.ts`
- `shared/i18n/translations.ts`
- `features/contacts/api.ts`
- `features/contacts/queries.ts`
- `features/contacts/schemas.ts`
- `features/contacts/components/contacts-table.tsx`
- `features/contacts/components/edit-contact-dialog.tsx`
- `features/users/api.ts`
- `features/users/queries.ts`
- `features/users/schemas.ts`
- `features/users/components/users-table.tsx`
- `features/users/components/update-user-status-dialog.tsx`
- `features/users/components/edit-user-dialog.tsx`
- `features/users/components/assign-user-roles-dialog.tsx`
- `features/users/components/assign-user-branches-dialog.tsx`
- `features/branches/api.ts`
- `features/branches/queries.ts`
- `features/branches/components/branches-table.tsx`
- `features/branches/components/terminals-table.tsx`
- `app/(dashboard)/contacts/page.tsx`
- `app/(dashboard)/users/page.tsx`
- `app/(dashboard)/branches/page.tsx`

## 11. Residual notes

- These modules still do not expose backend `lifecycle`, so action visibility cannot be inventory-style lifecycle-driven yet.
- Terminals still do not have a standalone list endpoint; the frontend continues to use branch detail as the source of truth.
- User hard delete blockers remain backend-enforced. The frontend adds only safe visible guards:
  - self delete hidden
  - platform admin delete hidden
  - last known owner hidden when it can be inferred from loaded data
- Contact hard delete blockers remain backend-enforced. The frontend now surfaces dependency reasons when the backend returns `CONTACT_DELETE_FORBIDDEN`.
- Sensitive branch configuration remains guarded in UI by `branches.configure`, but backend validation remains the final authority.
