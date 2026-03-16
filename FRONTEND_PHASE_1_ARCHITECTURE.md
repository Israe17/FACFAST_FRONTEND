# Frontend Phase 1 Architecture

## Objetivo

Construir la base del frontend para FACFAST usando Next.js App Router, TypeScript y shadcn/ui, dejando listo el proyecto para montar los modulos de administracion en la Fase 2 sin rehacer la infraestructura base.

## Alcance de la Fase 1

- Estructura de carpetas y layout raiz.
- Providers globales.
- Cliente HTTP unico con Axios y soporte para cookies HttpOnly.
- Autenticacion inicial: login, sesion y logout.
- Proteccion del dashboard.
- Sidebar, header y breadcrumbs base.
- Selector de sucursal activa con persistencia local validada.
- Helpers de permisos.
- Componentes shared reutilizables.
- Estados globales `loading`, `error` y `not-found`.

## Estructura objetivo

```text
app/
  (auth)/
    login/
      page.tsx
  (dashboard)/
    branches/
      page.tsx
    contacts/
      page.tsx
    roles/
      page.tsx
    users/
      page.tsx
    layout.tsx
    page.tsx
  layout.tsx
  providers.tsx
  globals.css
  loading.tsx
  error.tsx
  not-found.tsx

features/
  auth/
    api.ts
    queries.ts
    schemas.ts
    types.ts
    components/
      login-form.tsx

shared/
  components/
    action-button.tsx
    confirm-dialog.tsx
    data-card.tsx
    data-table.tsx
    empty-state.tsx
    error-state.tsx
    loading-state.tsx
    page-header.tsx
  lib/
    http.ts
    permissions.ts
    query-client.ts
    routes.ts
    utils.ts
  hooks/
    use-active-branch.tsx
    use-permissions.ts
    use-session.ts

components/
  ui/
  app-breadcrumbs.tsx
  app-header.tsx
  app-sidebar.tsx
  branch-switcher.tsx
```

## Decisiones tecnicas

### 1. Sesion y auth

- La sesion del frontend se apoya totalmente en cookies HttpOnly del backend.
- No se usa `localStorage` para tokens.
- `POST /auth/login` inicia sesion.
- `GET /auth/me` resuelve al usuario autenticado.
- `POST /auth/logout` cierra la sesion.
- El cliente Axios usara `withCredentials: true`.
- El cliente Axios consumira `baseURL = "/api"` para no exponer el backend real al navegador.
- Next.js resolvera `/api/*` con rewrites hacia la URL real del backend.
- Ante `401`, el cliente intentara `POST /auth/refresh` una vez antes de fallar.

### 2. Proteccion del dashboard

- El layout privado consultara la sesion en servidor usando la cookie de la request actual.
- Si no hay sesion valida, redireccionara a `/login`.
- La resolucion server-side seguira usando la URL real del backend solo desde el servidor.
- La sesion se hidrata en React Query para evitar una segunda carga innecesaria al montar la UI privada.

### 3. Sucursal activa

- La sucursal activa se persiste localmente con una clave propia del frontend.
- El valor persistido siempre se valida contra `branchIds` del usuario actual.
- Si el valor persistido deja de ser valido, se usa la primera sucursal permitida.

### 4. Permisos

- Se implementan helpers genericos para `hasPermission`, `hasAnyPermission`, `hasAllPermissions` y filtros de navegacion.
- La configuracion de rutas queda preparada para Fase 2 sin amarrarse todavia a la logica completa de cada modulo.

### 5. UI base

- shadcn/ui se usa como base visual.
- El dashboard tendra sidebar administrativa, header, breadcrumbs y area de contenido.
- Los modulos futuros se dejan como placeholders navegables.

## Variables de entorno previstas

- `BACKEND_URL`: URL real del backend usada solo del lado servidor y en rewrites de Next.

El cliente no necesita conocer esa URL. En produccion sobre Vercel, el navegador hablara solo con `/api/*`.

## Pendientes para Fase 2

- CRUD completo de `users`.
- CRUD completo de `roles`.
- CRUD completo de `branches`.
- CRUD completo de `contacts`.
- TanStack Table conectada a datos reales por modulo.
- Formularios de alta/edicion por modulo.
- Reglas finas de permisos por accion y por pantalla.
- Integracion de nombres reales de sucursales en lugar de solo IDs.
