# Frontend Tenant Context Flow Architecture

## Objetivo

Implementar un solo FACFAST con dos contextos operativos visibles y coherentes:

- `mode = platform`
- `mode = tenant_context`

El dashboard tenant sigue siendo el shell principal para operar dentro de una empresa. El frontend no crea una app separada ni un segundo cliente HTTP: interpreta la sesion real que ya resuelve el backend y adapta la UX segun el modo.

## Modelo de sesion

`GET /auth/me` se normaliza como la fuente de verdad para:

- `businessId`
- `branchIds`
- `userType`
- `isPlatformAdmin`
- `actingBusinessId`
- `actingBranchId`
- `mode`

Reglas de lectura:

- `tenant`: el usuario opera sobre `businessId`.
- `platform`: el usuario es platform admin pero no tiene tenant activo.
- `tenant_context`: el usuario es platform admin y opera sobre `actingBusinessId` y `actingBranchId` opcional.

## Hooks base

Se consolidan helpers para evitar logica duplicada y estados paralelos:

- `useSession`
  Expone `mode`, `isPlatformMode`, `isTenantContextMode`, `isTenantMode` y `activeBusinessId`.
- `usePlatformMode`
  Helper liviano para UI condicional de plataforma.
- `useTenantContext`
  Expone `actingBusinessId`, `actingBranchId`, `canEnterTenantContext`, `canClearTenantContext` e indica si el contexto esta fijado a nivel empresa.
- `useActiveBranch`
  Para tenant normal mantiene el comportamiento actual basado en `branchIds`.
  Para `tenant_context` queda bloqueado al `actingBranchId` recibido por sesion y, si no existe, reporta nivel empresa.
- `usePermissions`
  En tenant normal respeta RBAC frontend.
  En `tenant_context`, si el usuario es platform admin, no oculta los modulos base por permisos puramente visuales; el backend sigue siendo la autoridad final.

## Flujo de entrada a empresa

La entrada a empresa vive en `app/(platform)/superadmin/enter-context/page.tsx`.

Flujo:

1. El platform admin autenticado entra en `mode = platform`.
2. Usa un formulario con React Hook Form + Zod.
3. Selecciona empresa obligatoria.
4. Carga sucursales por `GET /platform/businesses/:id/branches`.
5. Selecciona sucursal opcional.
6. El frontend llama `POST /platform/enter-business-context`.
7. Se limpia cache operacional tenant.
8. Se refresca sesion con `GET /auth/me`.
9. Se redirige a `/business` para que la prueba visual inmediata sea la empresa activa real.

## Flujo de salida

La salida del contexto tenant se expone como accion visible en el header cuando `mode = tenant_context`.

Flujo:

1. El usuario hace click en `Salir de empresa`.
2. El frontend llama `POST /platform/clear-business-context`.
3. Se cancela cualquier query tenant activa.
4. Se limpia cache operacional tenant.
5. Se actualiza la sesion cliente a `mode = platform` de forma optimista para desmontar la UI tenant.
6. Se refresca sesion con `GET /auth/me`.
7. Se redirige a `app/(platform)/superadmin/enter-context/page.tsx`.

## Shell compartido

Se mantiene un solo shell visual:

- mismo layout general
- mismo header
- mismo sidebar
- mismas primitivas shadcn/ui

La diferencia esta en la interpretacion del `mode`:

- `platform`
  sidebar con navegacion de plataforma
  CTAs para entrar a empresa y administrar businesses
- `tenant` y `tenant_context`
  sidebar con navegacion tenant normal
  modulos `/business`, `/users`, `/roles`, `/branches`, `/contacts`
  las herramientas de plataforma pasan a segundo plano y se conservan como acciones de salida o retorno

## Header y sidebar

Impacto visual:

- El header muestra el modo actual.
- En `tenant_context` muestra empresa activa y sucursal activa o nivel empresa.
- En `tenant_context` muestra una accion clara para `Salir de empresa` / `Volver a modo plataforma`.
- El sidebar deja de mezclar un business local de plataforma con la sesion real.
- En `tenant_context`, el sidebar prioriza el menu tenant y no oculta los modulos base por filtros de permisos UI.

## Reutilizacion del dashboard normal

No se rehacen pantallas tenant.

El dashboard existente se reutiliza para:

- `/business`
- `/users`
- `/roles`
- `/branches`
- `/contacts`

Ademas:

- `/business` es la evidencia visual inmediata del tenant activo.
- `/` deja de ser una pantalla placeholder y pasa a ser un dashboard tenant utilitario con quick links reales a los modulos soportados.

Cuando la sesion llega en `tenant_context`, esos endpoints tenant operan naturalmente sobre el contexto backend (`acting_business_id`, `acting_branch_id`) sin introducir hacks de frontend.

## Rutas

Se mantiene la separacion por route groups:

- `app/(dashboard)`
  tenant normal y tenant context
- `app/(platform)/superadmin`
  herramientas plataforma y pantalla de entrada a empresa

Decisiones:

- El layout dashboard rechaza `mode = platform` y lo redirige a `/superadmin/enter-context`.
- Si la sesion cambia de `tenant` o `tenant_context` a `platform` mientras una pantalla tenant esta montada, un guard client-side desmonta el contenido tenant y redirige sin dejar queries operativas corriendo.
- El layout platform permite solo `mode = platform`.
- Se agrega `/business` como ruta canonica del modulo empresa y se deja compatibilidad con `/business-settings`.
- El enter context no vuelve a una home placeholder; aterriza en `/business`.

## Cache e invalidacion

Al entrar o salir del tenant context se limpian queries operacionales para evitar datos cruzados entre tenants:

- `businesses/current`
- `users`
- `roles`
- `branches`
- `contacts`

Luego se refresca `auth/session`.

## Fuera de esta fase

No se implementa todavia:

- impersonation
- login as user
- switch dinamico de branch despues de entrar sin reingresar al contexto
- billing SaaS
- planes o suscripciones
- modulos de inventario, compras, ventas, gastos, hacienda o contabilidad
