# Frontend Phase 2A Architecture

## Objetivo

Construir las features administrativas de `users` y `roles` sobre la base ya montada en Fase 1, manteniendo la arquitectura por `features`, la sesión actual por cookies HttpOnly, el cliente HTTP único con `baseURL = "/api"` y compatibilidad con despliegue en Vercel.

## Alcance

- Pantalla funcional de `users`.
- Pantalla funcional de `roles`.
- Tablas administrativas reutilizando la base shared.
- Formularios con React Hook Form + Zod.
- Dialogs consistentes con shadcn/ui.
- Feedback global con `sonner`.
- Respeto de permisos UI por acción.

## Features

### Users

La feature `users` incluirá:

- listado de usuarios
- create user
- edit user
- cambiar status
- cambiar password
- asignar roles
- asignar sucursales
- consultar permisos efectivos

Archivos previstos:

```text
features/users/
  api.ts
  queries.ts
  schemas.ts
  types.ts
  components/
    users-table.tsx
    user-form.tsx
    create-user-dialog.tsx
    edit-user-dialog.tsx
    change-user-password-dialog.tsx
    update-user-status-dialog.tsx
    assign-user-roles-dialog.tsx
    assign-user-branches-dialog.tsx
    effective-user-permissions-dialog.tsx
```

### Roles

La feature `roles` incluirá:

- listado de roles
- create role
- edit role
- delete role
- asignar permisos
- consultar permisos disponibles

Archivos previstos:

```text
features/roles/
  api.ts
  queries.ts
  schemas.ts
  types.ts
  components/
    roles-table.tsx
    role-form.tsx
    create-role-dialog.tsx
    edit-role-dialog.tsx
    assign-role-permissions-dialog.tsx
```

## Tablas

- Se reutiliza `shared/components/data-table.tsx` como wrapper base de TanStack Table.
- Cada feature define sus propias columnas, badges y acciones por fila.
- Las acciones se muestran solo si el usuario autenticado tiene permiso UI suficiente.
- Las pantallas manejarán estados `loading`, `error` y `empty` reutilizando la capa shared existente.

## Formularios

- Todos los formularios usarán React Hook Form + Zod.
- Los forms se montan dentro de dialogs de shadcn/ui.
- Se usarán componentes de UI consistentes para inputs, textarea, checkbox y diálogos.
- Las mutaciones muestran feedback con `toast.success`, `toast.error` o `toast.info`.

## Permisos UI

### Users

- `users.view`
- `users.create`
- `users.update`
- `users.change_status`
- `users.change_password`
- `users.assign_roles`
- `users.assign_branches`

### Roles

- `roles.view`
- `roles.create`
- `roles.update`
- `roles.delete`
- `roles.assign_permissions`
- `permissions.view`

## Integración con sesión actual

- Se mantiene `useSession()` como fuente de verdad del usuario autenticado.
- Se mantiene `usePermissions()` para ocultar acciones y secciones de UI.
- El dashboard sigue protegido por SSR en el layout privado ya existente.
- No se introduce un nuevo store global.

## Integración con multisucursal

- Para asignar sucursales a usuarios se reutiliza `useActiveBranch()` y el contexto actual de sucursales permitidas.
- La UI de asignación filtrará o validará sucursales según `branchIds` permitidos por la sesión actual cuando aplique.
- No se implementa todavía la pantalla completa de `branches`.

## Compatibilidad con backend existente

Como el backend no está en este workspace, la capa API del frontend usará dos medidas de compatibilidad:

1. Parsers tolerantes para respuestas de listado y detalle:
   - aceptarán arrays directos o contenedores comunes como `data`, `items` o `results`
2. Fallbacks controlados en algunas mutaciones sensibles:
   - `status`
   - `password`
   - `roles`
   - `branches`
   - `permissions`

Esto permite adaptarse a payloads comunes sin alterar la arquitectura ni inventar otro cliente HTTP.

## Sonner

- `Toaster` global en el provider raíz.
- Todas las mutaciones de users y roles usan `sonner`.
- No se usan `alert()` ni mensajes por consola como feedback funcional.

## Pendientes para Fase 2B

- frontend completo de `branches`
- frontend completo de `contacts`
- refinamiento de integración cruzada con catálogos reales de sucursales/contactos
