# Frontend Phase 2B Architecture

## Objetivo

Construir los modulos administrativos de `branches` y `contacts` sobre la base creada en Fase 1 y Fase 2A, manteniendo la misma arquitectura por `features`, compatibilidad con Vercel y autenticacion basada en cookies HttpOnly.

## Alcance

- Pantalla de sucursales con listado, creacion, edicion y gestion de terminales.
- Pantalla de contactos con listado, creacion, edicion y lookup por identificacion.
- Permisos UI por accion.
- Tablas reutilizables con TanStack Table.
- Formularios con React Hook Form + Zod.
- Mutaciones con TanStack Query y feedback mediante `sonner`.

## Branches Feature

### Endpoints integrados

- `GET /branches`
- `POST /branches`
- `GET /branches/:id`
- `PATCH /branches/:id`
- `POST /branches/:id/terminals`
- `PATCH /terminals/:id`

### Estructura

```text
features/
  branches/
    api.ts
    queries.ts
    schemas.ts
    types.ts
    components/
      branches-table.tsx
      branch-form.tsx
      create-branch-dialog.tsx
      edit-branch-dialog.tsx
      terminals-table.tsx
      terminal-form.tsx
      create-terminal-dialog.tsx
      edit-terminal-dialog.tsx
```

### Decisiones tecnicas

- `api.ts` usa el cliente HTTP compartido con `baseURL = "/api"` y parsers tolerantes para colecciones y entidades, igual que `users` y `roles`.
- La lista de sucursales se obtiene con `GET /branches`.
- El detalle de la sucursal seleccionada se obtiene con `GET /branches/:id` para resolver terminales sin sobrecargar la lista principal.
- Las mutaciones invalidan tanto el listado como el detalle de la sucursal afectada.
- La UI permite ver terminales de una sucursal en la misma pagina, debajo de la tabla principal.

### Permisos UI

- `branches.view`: habilita la pagina y la tabla.
- `branches.create`: muestra dialogo de crear sucursal.
- `branches.update`: muestra accion de editar sucursal.
- `branches.create_terminal`: muestra dialogo para crear terminal.
- `branches.update_terminal`: muestra accion de editar terminal.
- `branches.configure`: no redefine permisos de backend; se deja libre para ampliaciones futuras si el backend lo usa visualmente.

### Integracion con multisucursal

- La pagina muestra el contexto de la sucursal activa del usuario usando `useActiveBranch`.
- Si la sucursal seleccionada pertenece al contexto permitido del usuario, la UI puede marcarla como sucursal activa del shell sin romper el `branch-switcher` global.
- La administracion de branches no asume acceso global; solo renderiza lo que el backend entregue al usuario autenticado.

## Contacts Feature

### Endpoints integrados

- `GET /contacts`
- `POST /contacts`
- `GET /contacts/:id`
- `PATCH /contacts/:id`
- `GET /contacts/lookup/:identification`

### Estructura

```text
features/
  contacts/
    api.ts
    queries.ts
    schemas.ts
    types.ts
    components/
      contacts-table.tsx
      contact-form.tsx
      create-contact-dialog.tsx
      edit-contact-dialog.tsx
      contact-type-badge.tsx
```

### Decisiones tecnicas

- El contrato del backend se conserva usando campos `snake_case` en el formulario y en los payloads principales.
- La capa API acepta respuestas envueltas en `data`, `item`, `result` o `contact` para tolerar variaciones sin cambiar el backend.
- El lookup por identificacion usa TanStack Query con ejecucion controlada desde la pantalla para permitir una busqueda simple sin introducir otro store global.
- El formulario soporta todos los campos pedidos para contactos y exoneraciones.

### Permisos UI

- `contacts.view`: habilita la pagina y la tabla.
- `contacts.create`: muestra dialogo de crear contacto.
- `contacts.update`: muestra accion de editar contacto.

## Tablas

- `BranchesTable` lista sucursales, estado, cantidad de terminales y acciones.
- `TerminalsTable` lista terminales de la sucursal seleccionada y sus acciones.
- `ContactsTable` lista contactos, tipo, identificacion, datos de contacto, estado y acciones.
- Todas las tablas reutilizan `shared/components/data-table.tsx`.

## Formularios

- `BranchForm` y `TerminalForm` comparten el mismo patron de `users` y `roles`: `react-hook-form`, `buildFormResolver` y `ActionButton`.
- `ContactForm` organiza los campos por secciones para evitar una pantalla plana y mantener una UI administrativa clara.
- Las validaciones Zod priorizan compatibilidad con el backend y no fuerzan enums que puedan romper contratos existentes.

## Integracion con sesion actual

- Los permisos UI se resuelven exclusivamente con `useSession()` y `usePermissions()`.
- No se crean stores globales nuevos.
- La estrategia de auth con cookies HttpOnly, `/api` y rewrites de Next se mantiene intacta.

## Uso de Sonner

- Todas las mutaciones usan `toast.success` y `toast.error`.
- Los mensajes exponen el mensaje del backend cuando existe mediante `getErrorMessage`.
- No se usa `alert()` ni `console.log()` como feedback al usuario.

## Pendientes para Fase 3

- Inventory
- Products
- Purchases
- Sales
- Expenses
- Hacienda
- Accounting
