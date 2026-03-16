# Auditoría Completa del Frontend y Arquitectura — FACFAST SaaS

**Fecha:** 2026-03-16
**Proyecto:** FACFAST — Plataforma SaaS Multi-Tenant para Gestión Empresarial (ERP)
**Versión auditada:** Commit `8fe5a47` (Frontend) / `2914e72` (Backend)
**Auditor:** Claude Code (Opus 4.6)

---

## Resumen Ejecutivo

### Puntaje General: 6.5 / 10

FACFAST tiene una **base arquitectónica sólida y bien pensada**. La organización feature-based, el uso de React Query como estado centralizado, la autenticación con HttpOnly cookies y el tipado estricto con TypeScript demuestran criterio técnico. Sin embargo, existen **gaps críticos** en testing (0%), accesibilidad, performance y seguridad que deben resolverse antes de producción.

### Top 5 Problemas Más Críticos

| # | Problema | Severidad | Impacto |
|---|----------|-----------|---------|
| 1 | **Zero tests** — 0% cobertura, sin framework de testing configurado | CRÍTICA | Imposible garantizar estabilidad en releases |
| 2 | **Componentes monolíticos** — 14+ archivos >150 líneas, algunos >800 | CRÍTICA | Mantenibilidad, debugging y code review degradados |
| 3 | **Accesibilidad deficiente** — Solo 12 atributos aria en todo el codebase | CRÍTICA | No cumple WCAG 2.1 AA, excluye usuarios con discapacidades |
| 4 | **Zero memoización** — Ningún useMemo/useCallback/React.memo | ALTA | Rendimiento degradará significativamente con datos reales |
| 5 | **Seguridad backend** — JWT defaults inseguros, sin rate limiting, sin CSP/helmet | ALTA | Vulnerable a fuerza bruta, inyección de headers, token theft |

### Top 5 Quick Wins (Mejoras Fáciles de Alto Impacto)

| # | Quick Win | Esfuerzo | Impacto |
|---|-----------|----------|---------|
| 1 | Agregar `timeout: 15000` al HTTP client (`shared/lib/http.ts`) | 1 línea | Previene peticiones colgadas indefinidamente |
| 2 | Corregir `--font-manrope` → `--font-inter` en `app/layout.tsx:8` | 1 línea | Fix de naming inconsistente |
| 3 | Mover 3+ strings hardcodeados a `translations.ts` | 10 min | Consistencia i18n |
| 4 | Agregar Prettier + `.prettierrc` + script `format` | 15 min | Formatting consistente en equipo |
| 5 | Crear `middleware.ts` para redirect de auth a nivel HTTP | 30 min | Protección de rutas más robusta |

---

## Fase 1: Reconocimiento del Proyecto

### 1.1 Estructura del Repositorio

```
FACFAST_FRONTEND/                    FACFAST_BACKEND/
├── app/                             ├── src/
│   ├── (auth)/                      │   ├── modules/
│   │   ├── login/page.tsx           │   │   ├── auth/
│   │   └── onboarding/page.tsx      │   │   ├── users/
│   ├── (dashboard)/                 │   │   ├── rbac/
│   │   ├── inventory/               │   │   ├── businesses/
│   │   ├── users/page.tsx           │   │   ├── branches/
│   │   ├── roles/page.tsx           │   │   ├── contacts/
│   │   ├── branches/page.tsx        │   │   ├── inventory/
│   │   ├── contacts/page.tsx        │   │   ├── platform/
│   │   ├── business/page.tsx        │   │   └── common/
│   │   └── layout.tsx               │   ├── config/
│   ├── (platform)/superadmin/       │   ├── configure-app.ts
│   ├── layout.tsx                   │   └── main.ts
│   ├── providers.tsx                ├── package.json
│   ├── globals.css                  ├── tsconfig.json
│   ├── error.tsx                    └── .env.example
│   └── not-found.tsx
├── features/
│   ├── auth/
│   ├── branches/
│   ├── businesses/
│   ├── contacts/
│   ├── inventory/
│   ├── platform-businesses/
│   ├── platform-context/
│   ├── roles/
│   └── users/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── i18n/
├── components/ui/  (23 shadcn components)
├── package.json
├── tsconfig.json
├── next.config.ts
└── pnpm-lock.yaml
```

**Framework:** Next.js 16.1.6 (App Router)
**Lenguaje:** TypeScript 5 (strict mode)
**Bundler:** Next.js built-in (Turbopack/Webpack)
**Package Manager:** pnpm
**~130+ archivos TypeScript/TSX, ~28,000 líneas de código**

### 1.2 Dependencias

| Dependencia | Versión | Estado |
|-------------|---------|--------|
| next | 16.1.6 | Actualizada |
| react / react-dom | 19.2.3 | Actualizada |
| typescript | ^5 | Actualizada |
| tailwindcss | ^4 (v4.2.1) | Actualizada |
| @tanstack/react-query | ^5.90.21 | Actualizada |
| @tanstack/react-table | ^8.21.3 | Actualizada |
| react-hook-form | ^7.71.2 | Actualizada |
| @hookform/resolvers | ^5.2.2 | Actualizada |
| zod | ^4.3.6 | Actualizada |
| axios | ^1.13.6 | Actualizada |
| shadcn | 4.0.5 | Actualizada |
| lucide-react | 0.577.0 | Actualizada |
| sonner | ^2.0.7 | Actualizada |
| clsx | ^2.1.1 | Actualizada |
| tailwind-merge | ^3.5.0 | Actualizada |
| class-variance-authority | ^0.7.1 | Actualizada |

**Dependencias desactualizadas:** Ninguna detectada
**Dependencias duplicadas:** Ninguna
**Dead dependencies:** Ninguna obvia
**Lockfile:** `pnpm-lock.yaml` presente (7,900 líneas), consistente
**Vulnerabilidades conocidas:** No se ejecutó `pnpm audit` (recomendado)

### 1.3 Configuración

| Archivo | Estado | Notas |
|---------|--------|-------|
| `tsconfig.json` | Bien | strict mode, path aliases (@/*), bundler resolution |
| `next.config.ts` | Bien | Rewrites /api/* → backend, BACKEND_URL configurable |
| `eslint.config.mjs` | Insuficiente | Solo core-web-vitals + typescript básico |
| `postcss.config.mjs` | Bien | @tailwindcss/postcss |
| `components.json` | Bien | shadcn/ui configurado correctamente |
| `.prettierrc` | **FALTA** | Sin formatting enforced |
| `middleware.ts` | **FALTA** | Sin protección a nivel HTTP |
| `.env.example` | **FALTA** | Solo en backend, no en frontend |
| `jest.config.*` / `vitest.config.*` | **FALTA** | Sin testing framework |

---

## Fase 2: Arquitectura del Frontend

### 2.1 Patrón de Arquitectura

**Patrón:** Feature-based (modular por dominio)
**Evaluación: EXCELENTE**

Cada feature sigue un patrón consistente:
```
features/[feature]/
├── api.ts              # HTTP calls + serialización
├── queries.ts          # React Query hooks
├── schemas.ts          # Zod validation (espejo de DTOs backend)
├── types.ts            # TypeScript types (inferidos de schemas)
├── form-values.ts      # (opcional) Defaults y mapeo entity→form
├── constants.ts        # (opcional) Enums, valores estáticos
└── components/
    ├── [entity]-form.tsx
    ├── [entity]-dialog.tsx
    └── [entity]-table.tsx
```

La separación entre `/features` (lógica de dominio), `/shared` (utilidades transversales), `/components/ui` (primitivos UI) y `/app` (routing) es clara y bien mantenida. No hay imports cruzados entre features.

### 2.2 Manejo de Estado

**Solución:** React Query (TanStack Query v5) como single source of truth
**Evaluación: EXCELENTE**

- No usa Redux, Zustand, ni Context API para estado global (correctamente)
- React Query para todo el estado del servidor: sesión, negocio, usuarios, inventario, etc.
- `useSyncExternalStore` para branch selection con localStorage (uso apropiado)
- `staleTime: 5min`, `gcTime: 30min`, `refetchOnWindowFocus: false`
- Retry inteligente: no retry en 400/401/403/404, max 1 retry en otros
- Invalidación selectiva por query key en mutations
- Dehydration/hydration para SSR en layouts

**No hay prop drilling excesivo** — los hooks custom (`useSession`, `usePermissions`, `useActiveBranch`) encapsulan correctamente el acceso a estado.

### 2.3 Routing

**Sistema:** Next.js App Router con route groups
**Evaluación: BUENO (con observaciones)**

| Grupo | Protección | Evaluación |
|-------|-----------|------------|
| `(auth)` | Público | Correcto |
| `(dashboard)` | Layout server-side: verifica session + `hasTenantOperationalAccess()` | Bueno pero sin middleware |
| `(platform)/superadmin` | Layout server-side: verifica `is_platform_admin` + `isPlatformMode()` | Bueno pero sin middleware |

**Rutas definidas (17 APP_ROUTES):**
- Login, onboarding
- Dashboard, business, business-settings, users, roles, branches, contacts
- Inventory (catalogs, products, pricing, warehouses, operations/stock/lots/movements)
- Superadmin (businesses, enter-context)

**Observaciones:**
- No hay `middleware.ts` — la protección ocurre en layouts server-side, que es funcional pero no óptimo. Un middleware redirect sería más eficiente (evita renderizar el layout completo antes de redirigir)
- No se usa `next/dynamic` — sin lazy loading explícito de componentes pesados
- `/business-settings` parece ser una ruta legacy/deprecada que duplica `/business`
- No hay lazy loading de rutas (Next.js App Router lo hace automáticamente por page, pero los componentes dentro de cada page se cargan estáticamente)

### 2.4 Comunicación con API

**Cliente:** Axios centralizado en `shared/lib/http.ts`
**Proxy:** Next.js rewrites (`/api/*` → `$BACKEND_URL/*`)
**Evaluación: BUENO (con observaciones)**

**Fortalezas:**
- Cliente único centralizado
- `withCredentials: true` para cookies HttpOnly
- Interceptor 401 con mutex para refresh token (previene race conditions)
- Skip de refresh en rutas de auth (evita loops)
- Server-side client separado con URL de backend directa

**Debilidades:**
- Sin `timeout` configurado — peticiones pueden colgar indefinidamente
- Sin retry automático para errores de red (solo 401)
- Sin logging/telemetría para debugging
- Sin cancel de requests (AbortController) para componentes que se desmontan

**Endpoints:** Centralizados en `features/*/api.ts`, no hardcodeados en componentes. Correcto.

**Estados de loading/error/empty:** Implementados consistentemente via React Query + componentes compartidos (`LoadingState`, `ErrorState`, `EmptyState`). Excelente.

### 2.5 Autenticación y Autorización

**Evaluación: MUY BUENO (con observaciones de seguridad en backend)**

**Frontend:**
- Tokens almacenados en **HttpOnly cookies** (no localStorage) — Excelente
- `withCredentials: true` en todas las peticiones
- Interceptor de refresh token con mutex pattern
- Session se obtiene via `GET /auth/me` con React Query
- Logout limpia todo el queryClient + redirect a login
- RBAC implementado con `usePermissions()` hook: `canAny()`, `canAll()`
- Sidebar filtrado por permisos vía `filterItemsByPermissions()`
- `TenantModeGuard` bloquea acceso sin contexto tenant

**Backend (hallazgos de seguridad):**
- JWT secrets con defaults inseguros: `'change-me-access-secret'` como fallback (debería fallar si no se configura)
- `cookie_same_site` default es `'none'` — el más permisivo
- `cookie_secure` default es `true` (bien), pero `.env.example` lo pone en `false`
- Sin rate limiting en ningún endpoint
- Sin helmet/CSP headers
- CORS `origin: true` en non-production (acepta cualquier origen)

---

## Fase 3: Calidad del Código

### 3.1 Componentes

#### Componentes que superan 300 líneas (deben dividirse):

| Archivo | Líneas | Razón para dividir |
|---------|--------|-------------------|
| `features/inventory/components/inventory-movements-section.tsx` | 866 | Mezcla CRUD completo: form, dialog, table, validación, 4 tipos de movimiento |
| `features/inventory/components/products-section.tsx` | 795 | Form + dialog + table + cards + filters en un solo archivo |
| `components/ui/sidebar.tsx` | 702 | Componente UI de shadcn (aceptable como generado) |
| `features/inventory/components/inventory-lots-section.tsx` | 579 | CRUD completo mezclado |
| `features/inventory/components/promotions-section.tsx` | 555 | CRUD completo mezclado |
| `features/inventory/components/tax-profiles-section.tsx` | 526 | CRUD completo mezclado |
| `features/inventory/components/product-prices-section.tsx` | 501 | CRUD completo mezclado |
| `features/inventory/components/warehouse-locations-section.tsx` | 466 | CRUD completo mezclado |
| `features/inventory/components/warehouses-section.tsx` | 445 | CRUD completo mezclado |
| `features/inventory/components/inventory-product-detail.tsx` | 429 | Detalle con múltiples secciones |
| `features/inventory/components/warranty-profiles-section.tsx` | 424 | CRUD completo mezclado |
| `features/inventory/components/product-categories-section.tsx` | 405 | CRUD completo mezclado |
| `features/inventory/components/price-lists-section.tsx` | 401 | CRUD completo mezclado |
| `features/branches/components/branch-form.tsx` | 380 | Form con muchos campos + terminals |

**Patrón detectado:** Todos los componentes de inventario siguen el anti-patrón de "section monolítica" que mezcla form, dialog de crear, dialog de editar, tabla y lógica de estado en un solo archivo. Deberían dividirse en:
- `[entity]-form.tsx` — formulario reutilizable
- `[entity]-create-dialog.tsx` — dialog de creación
- `[entity]-edit-dialog.tsx` — dialog de edición
- `[entity]-table.tsx` — tabla con columnas
- `[entity]-section.tsx` — orquestador que une todo

### 3.2 Tipado (TypeScript)

**Evaluación: EXCELENTE**

- **Zero uso de `any`** en todo el codebase
- Tipos inferidos de Zod schemas (`z.infer<typeof schema>`)
- Interfaces bien definidas por feature
- Tipado correcto de respuestas API
- `AuthenticatedUserContext` bien definido con todos los campos de sesión
- Path aliases (`@/*`) configurados correctamente

### 3.3 Manejo de Errores

**Evaluación: EXCELENTE**

Infraestructura de errores robusta con 5 archivos dedicados:

| Archivo | Responsabilidad |
|---------|----------------|
| `shared/lib/api-error.ts` | Tipos de error custom |
| `shared/lib/backend-error-parser.ts` | Parsing unificado de respuestas de error |
| `shared/lib/error-presentation.ts` | Presentación de errores (toast, banner) |
| `shared/lib/form-error-mapper.ts` | Mapeo de errores backend → campos de formulario |
| `shared/hooks/use-backend-form-errors.ts` | Hook para errores de formulario |

- `app/error.tsx` funciona como error boundary a nivel de página
- Todos los mutations tienen `onError` con toast
- Backend errors parseados y mapeados a campos de formulario
- `presentBackendErrorToast()` usado consistentemente

**Observación:** Falta un `ErrorBoundary` componente reutilizable para aislamiento de errores a nivel de sección (no solo página).

### 3.4 Performance

**Evaluación: DEFICIENTE**

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| `useMemo` | No usado | Zero instancias en todo el proyecto |
| `useCallback` | No usado | Zero instancias |
| `React.memo` | No usado | Zero instancias |
| Code splitting | Parcial | Next.js hace split por página, pero sin `next/dynamic` |
| Lazy loading imágenes | No implementado | Sin `next/image` |
| Virtualización de listas | No implementado | DataTable renderiza todas las filas |
| Paginación | No implementado | DataTable solo usa `getCoreRowModel()` |

**Componentes críticos sin memoización:**
- `inventory-movements-section.tsx` (866 líneas) con múltiples inline functions
- `products-section.tsx` (795 líneas) con filtering inline
- Todas las tablas que reciben `columns` como array literal (re-creado en cada render)

**DataTable (`shared/components/data-table.tsx`):**
- Solo 81 líneas con funcionalidad mínima
- Solo `getCoreRowModel()` — sin sorting, filtering, pagination
- Renderiza TODAS las filas (sin virtualización)
- Con 1,000+ registros de inventario, el rendimiento será inaceptable
- String hardcodeado en español: `"No hay registros disponibles."`

---

## Fase 4: UI/UX — Revisión de la Interfaz

### 4.1 Sistema de Diseño

**Evaluación: BUENO**

- **Librería de componentes:** shadcn/ui (23 componentes en `/components/ui/`)
- **Iconos:** Lucide React
- **CSS:** Tailwind CSS v4 con CSS variables personalizadas
- **Design tokens centralizados:** Sí, en `globals.css` con variables oklch
- **Paleta de colores:** Consistente (primary azul, destructive rojo, accent celeste)
- **Espaciados:** Tailwind utilities (consistentes)
- **Tipografía:** Inter (sans) + JetBrains Mono (monospace)
- **Bordes:** Sistema de radius con base `0.75rem` y multiplicadores

**Dark mode:**
- CSS variables definidas para `.dark` class
- Custom variant configurado: `@custom-variant dark (&:is(.dark *))`
- **PERO: No hay toggle/switch de tema** — sin `next-themes` ni ThemeProvider
- No hay forma para el usuario de cambiar entre temas

**Bug detectado:**
- `app/layout.tsx:8`: `Inter` font cargada como variable `--font-manrope`
- Debería ser `--font-inter` o renombrar la referencia en `globals.css`

### 4.2 Encoding e i18n

**Evaluación: BUENO (con observaciones)**

**Sistema i18n:**
- `shared/i18n/translations.ts` — 1,352+ líneas de traducciones español/inglés
- `use-app-translator.ts` — Hook para acceder al traductor
- `use-app-language.ts` — Hook para idioma activo (desde `active_business_language` de la sesión)
- Idioma base: español (Costa Rica)
- HTML lang: `es`

**Strings hardcodeados fuera del sistema i18n:**

| Archivo | String |
|---------|--------|
| `shared/components/data-table.tsx:31` | `"No hay registros disponibles."` |
| `components/app-header.tsx` | `"Sin contexto tenant activo"` |
| `features/businesses/components/business-onboarding-form.tsx` | `"Crear terminal inicial"` |

**Fechas/números:** `formatDateTime()` en `shared/lib/utils.ts` usa `es-CR` locale. Correcto.

**Encoding UTF-8:** No se detectaron problemas de encoding (como `Ã³` en vez de `ó`).

### 4.3 Responsividad

**Evaluación: BUENO**

- `useIsMobile()` hook con breakpoint 768px
- 199+ instancias de clases responsive (`md:`, `sm:`, `lg:`)
- Sidebar con modo mobile (Sheet/drawer)
- Forms con grids responsive (`md:grid-cols-2`, `md:grid-cols-3`)
- `SIDEBAR_WIDTH_MOBILE = "18rem"`

**Observaciones:**
- DataTable no tiene versión mobile (tablas horizontales sin scroll optimization)
- No hay bottom navigation para mobile
- Las tablas grandes serán difíciles de usar en pantallas pequeñas

### 4.4 Accesibilidad (a11y)

**Evaluación: CRÍTICO — No cumple WCAG 2.1 AA**

**Solo 12 atributos aria en todo el codebase.** Gaps detectados:

| Gap | Impacto | Dónde |
|-----|---------|-------|
| `aria-describedby` ausente | Errores de formulario no asociados a inputs | Todos los formularios |
| `aria-invalid` ausente | Campos inválidos no marcados para screen readers | Todos los formularios |
| `aria-label` ausente en icon buttons | Botones sin texto accesible | Edit, Delete, View buttons en tablas |
| `aria-live` ausente | Errores/toasts no anunciados a screen readers | Error banners, toast notifications |
| `aria-required` ausente | Campos obligatorios no marcados | Formularios con campos requeridos |
| `role` ausente | Componentes custom sin roles semánticos | Dialogs custom, navigation |
| Focus management | Sin focus trap en modals, sin skip links | Toda la app |
| Keyboard navigation | No verificada/implementada | Toda la app |
| Color contrast | No verificado contra WCAG AA | Colores oklch (probable cumplimiento) |
| Alt text | Sin imágenes en el codebase actual | N/A actualmente |

**Ejemplo concreto — icon button sin aria-label:**
```tsx
// products-section.tsx
<Button size="sm" variant="outline" onClick={() => openEditDialog(product)}>
  <Pencil className="size-4" />
</Button>
// Un screen reader diría "button" sin contexto
```

### 4.5 Empty States y Edge Cases

**Evaluación: MUY BUENO**

- `EmptyState` componente reutilizable con ícono, título, descripción y CTA opcional
- `LoadingState` con spinner animado y opción fullPage
- `ErrorState` con retry button
- `not-found.tsx` con link al dashboard
- `error.tsx` con reset y logging

**Observación:** No hay skeleton loading (shimmer) — solo spinners. Los skeletons brindan mejor UX durante la carga.

---

## Fase 5: Seguridad del Frontend

### 5.1 XSS

**Riesgo: BAJO**

- Zero instancias de `dangerouslySetInnerHTML`
- Zero instancias de `v-html`
- React escapa automáticamente la interpolación JSX
- Sin inyección de HTML dinámico

### 5.2 Validación de Inputs

**Estado: BUENO**

- Zod schemas validan en frontend antes de enviar
- `class-validator` + `whitelist: true` + `forbidNonWhitelisted: true` en backend
- Doble validación (frontend + backend)

### 5.3 Tokens y Credenciales

**Estado: BUENO en frontend, PREOCUPANTE en backend**

**Frontend:**
- Tokens en HttpOnly cookies (no accesibles via JavaScript)
- `withCredentials: true` para CORS
- Sin tokens/API keys en código fuente
- Sin secretos hardcodeados

**Backend:**
- JWT secrets con fallback defaults inseguros en `src/config/auth.config.ts`:
  ```typescript
  access_token_secret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret',
  refresh_token_secret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-secret',
  ```
  **Nota:** `env.validation.ts` sí valida que estas variables existan al arrancar, mitigando el riesgo. Sin embargo, el patrón de tener defaults inseguros en el código es riesgoso si alguien bypasea la validación.
- `FIELD_ENCRYPTION_KEY` en `.env.example` con placeholder (correcto)
- Refresh tokens hasheados antes de persistir (no plaintext) — Excelente práctica
- Argon2id para password hashing con parámetros fuertes (memory: 19456 KiB, time: 2) — Excelente

### 5.4 Variables de Entorno

**Estado: PARCIAL**

- Frontend: No existe `.env.example` (solo `BACKEND_URL` usado, pero debería documentarse)
- Backend: `.env.example` existe con valores de ejemplo
- **Peligro en `.env.example`:** `DB_SYNCHRONIZE=true` — destruiría datos en producción si se copia directamente

### 5.5 Headers de Seguridad (CSP, CORS)

**Estado: DEFICIENTE**

| Header | Estado |
|--------|--------|
| CORS | `origin: true` en non-production (acepta CUALQUIER origen) |
| CSP (Content-Security-Policy) | No configurado |
| Helmet | No instalado |
| X-Frame-Options | No configurado |
| X-Content-Type-Options | No configurado |
| Strict-Transport-Security | No configurado |

### 5.6 CSRF

**Estado: PARCIAL**

- Cookies con `SameSite` configurado (default `'none'` en config, `'lax'` en `.env.example`)
- `SameSite='none'` es el default en código — debería ser `'lax'` o `'strict'`
- Sin CSRF tokens explícitos (las cookies SameSite proveen protección parcial)

---

## Fase 6: Testing y DX (Developer Experience)

### 6.1 Tests

**Evaluación: INEXISTENTE**

- **Zero archivos de test** (`.test.ts`, `.spec.ts`) en el frontend
- Sin framework de testing configurado (ni Jest, ni Vitest, ni Playwright, ni Cypress)
- Sin scripts de test en `package.json`
- **Cobertura: 0%**

Backend tiene Jest configurado con **16 archivos de test** (unit + e2e), incluyendo tests de auth, guards, policies, services y un e2e completo con pg-mem (PostgreSQL in-memory). Cobertura exacta no verificada.

### 6.2 CI/CD

**Evaluación: INEXISTENTE**

- Sin GitHub Actions
- Sin archivos de pipeline (`.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`)
- Sin Dockerfile ni docker-compose
- Sin configuración de deployment

### 6.3 Linting y Formatting

**Evaluación: BÁSICO**

| Herramienta | Estado |
|-------------|--------|
| ESLint | Configurado (mínimo: core-web-vitals + typescript básico) |
| Prettier | **No configurado** |
| Husky (pre-commit hooks) | **No configurado** |
| lint-staged | **No configurado** |
| eslint-plugin-jsx-a11y | **No instalado** |
| eslint-plugin-react-hooks | Incluido via Next.js config |

### 6.4 Documentación

**Evaluación: BUENO (arquitectura) / MALO (setup)**

**Documentación de arquitectura (8 archivos, ~42 KB total):**
- `FRONTEND_PHASE_1_ARCHITECTURE.md` — Setup inicial
- `FRONTEND_PHASE_2A_ARCHITECTURE.md` — CRUD modules
- `FRONTEND_PHASE_2B_ARCHITECTURE.md` — Inventario
- `FRONTEND_FORM_MODULE_PATTERN_ARCHITECTURE.md` — Patrones de formularios
- `FRONTEND_SYSTEM_MODULES_API_ALIGNMENT_ARCHITECTURE.md` — Alineación DTO
- `FRONTEND_TENANT_CONTEXT_FLOW_ARCHITECTURE.md` — Multi-tenancy
- `FRONTEND_ACTIVE_LANGUAGE_I18N_ARCHITECTURE.md` — Internacionalización
- `FRONTEND_ERROR_CONSUMPTION_ARCHITECTURE.md` — Manejo de errores

**README:** Genérico de Next.js — sin instrucciones de setup, sin variables de entorno documentadas, sin guía de contribución.

---

## Hallazgos Detallados

### Hallazgo #1
**[SEVERIDAD: CRÍTICA]**
**Área:** Testing / DX
**Archivo(s):** Todo el frontend
**Descripción:** Zero tests en todo el frontend. Sin framework de testing configurado.
**Impacto:** Imposible garantizar que los cambios no rompan funcionalidad existente. Cada release es un acto de fe.
**Recomendación:** Configurar Vitest + React Testing Library. Empezar con tests de hooks críticos (`useSession`, `usePermissions`) y formularios de auth.
**Esfuerzo estimado:** 3d (setup + tests iniciales)

### Hallazgo #2
**[SEVERIDAD: CRÍTICA]**
**Área:** Código / Arquitectura
**Archivo(s):** `features/inventory/components/*.tsx` (12 archivos)
**Descripción:** Componentes monolíticos de 400-866 líneas que mezclan form, dialog, table y lógica de estado en un solo archivo.
**Impacto:** Mantenibilidad degradada, code review difícil, imposible testear partes individuales, re-renders innecesarios.
**Recomendación:** Dividir cada `*-section.tsx` en `*-form.tsx`, `*-create-dialog.tsx`, `*-edit-dialog.tsx`, `*-table.tsx` y `*-section.tsx` (orquestador).
**Esfuerzo estimado:** 1 semana

### Hallazgo #3
**[SEVERIDAD: CRÍTICA]**
**Área:** UX / Accesibilidad
**Archivo(s):** Todo el frontend
**Descripción:** Solo 12 atributos aria en todo el codebase. Faltan aria-describedby, aria-invalid, aria-label, aria-live, roles.
**Impacto:** Usuarios con discapacidades no pueden usar la aplicación. Posible riesgo legal (ADA compliance).
**Recomendación:** Agregar aria-label a todos los icon buttons, aria-describedby en formularios, aria-live en error banners. Instalar eslint-plugin-jsx-a11y.
**Esfuerzo estimado:** 3d

### Hallazgo #4
**[SEVERIDAD: ALTA]**
**Área:** Performance
**Archivo(s):** Todo el frontend
**Descripción:** Zero instancias de useMemo, useCallback o React.memo. Funciones inline y arrays literales re-creados en cada render.
**Impacto:** Re-renders innecesarios, especialmente en componentes de inventario con listas grandes. Rendimiento degradará con datos reales.
**Recomendación:** Memoizar column definitions de tablas, event handlers en componentes con listas, y componentes de formulario pesados.
**Esfuerzo estimado:** 1d

### Hallazgo #5
**[SEVERIDAD: ALTA]**
**Área:** Performance
**Archivo(s):** `shared/components/data-table.tsx`
**Descripción:** DataTable solo usa getCoreRowModel(). Sin paginación, sorting, filtering ni virtualización. Renderiza TODAS las filas.
**Impacto:** Con 1,000+ movimientos de inventario o productos, la tabla será inutilizable (DOM bloat, lag).
**Recomendación:** Agregar getSortedRowModel, getFilteredRowModel, getPaginationRowModel de TanStack Table. Considerar virtualización con @tanstack/react-virtual para datasets >500 filas.
**Esfuerzo estimado:** 1d

### Hallazgo #6
**[SEVERIDAD: ALTA]**
**Área:** Seguridad
**Archivo(s):** `FACFAST_BACKEND/src/config/auth.config.ts`
**Descripción:** JWT secrets tienen defaults inseguros (`'change-me-access-secret'`). La app arranca sin configurar secrets reales.
**Impacto:** Si alguien bypasea `env.validation.ts`, los tokens JWT serían predecibles. La validación de env mitiga el riesgo, pero el patrón es peligroso.
**Recomendación:** Eliminar los defaults de fallback en `auth.config.ts`. Si `env.validation.ts` ya valida su existencia, los `?? 'change-me'` son código muerto peligroso — eliminarlos.
**Esfuerzo estimado:** 1h

### Hallazgo #7
**[SEVERIDAD: ALTA]**
**Área:** Seguridad
**Archivo(s):** `FACFAST_BACKEND/src/configure-app.ts`
**Descripción:** Sin rate limiting. Sin helmet/CSP. CORS `origin: true` en non-production.
**Impacto:** Vulnerable a fuerza bruta en login, clickjacking, sniffing de content-type, y XSS via headers.
**Recomendación:** Instalar `@nestjs/throttler` para rate limiting (especialmente en /auth/login). Instalar `helmet` para headers de seguridad. Configurar CORS restrictivo incluso en desarrollo.
**Esfuerzo estimado:** 4h

### Hallazgo #8
**[SEVERIDAD: ALTA]**
**Área:** Seguridad
**Archivo(s):** `FACFAST_BACKEND/src/config/auth.config.ts`
**Descripción:** Cookie `SameSite` default es `'none'` en el código (el más permisivo). `.env.example` tiene `'lax'` pero el código usa `'none'` si no se configura.
**Impacto:** Cookies enviadas en requests cross-site, facilitando CSRF.
**Recomendación:** Cambiar default de `'none'` a `'lax'` en auth.config.ts.
**Esfuerzo estimado:** 1h

### Hallazgo #9
**[SEVERIDAD: ALTA]**
**Área:** DX
**Archivo(s):** Todo el proyecto
**Descripción:** Sin CI/CD. Sin GitHub Actions. Sin Dockerfile.
**Impacto:** No hay verificación automática de builds, lint ni tests. Deployments son manuales y propensos a errores.
**Recomendación:** Crear pipeline básico: lint → type-check → build → test. Agregar Dockerfile para deployment consistente.
**Esfuerzo estimado:** 4h

### Hallazgo #10
**[SEVERIDAD: MEDIA]**
**Área:** Arquitectura
**Archivo(s):** Frontend root (falta `middleware.ts`)
**Descripción:** Sin Next.js middleware para protección de rutas. La protección ocurre en layouts server-side.
**Impacto:** Cada request no autenticado renderiza el layout completo antes de redirigir. Menos eficiente y potencialmente expone componentes server-side a usuarios no autenticados brevemente.
**Recomendación:** Crear `middleware.ts` que verifique la cookie `ff_access_token` y redirect a `/login` para rutas protegidas.
**Esfuerzo estimado:** 4h

### Hallazgo #11
**[SEVERIDAD: MEDIA]**
**Área:** Performance
**Archivo(s):** `shared/lib/http.ts`
**Descripción:** Sin timeout configurado en el cliente Axios. Las peticiones pueden colgar indefinidamente.
**Impacto:** UX degradada si el backend no responde (spinner infinito sin feedback).
**Recomendación:** Agregar `timeout: 15000` (15s) en `createHttpClient()`.
**Esfuerzo estimado:** 1h

### Hallazgo #12
**[SEVERIDAD: MEDIA]**
**Área:** Performance
**Archivo(s):** Todo el frontend
**Descripción:** Sin uso de `next/image` para optimización de imágenes. Sin lazy loading de imágenes.
**Impacto:** Imágenes (logos de negocio, fotos de productos) se cargarán sin optimización, sin responsive sizing, sin lazy loading.
**Recomendación:** Usar `next/image` con `sizes` y `priority` props donde corresponda.
**Esfuerzo estimado:** 4h

### Hallazgo #13
**[SEVERIDAD: MEDIA]**
**Área:** UI
**Archivo(s):** `app/layout.tsx:8`
**Descripción:** Font `Inter` cargada con variable CSS `--font-manrope`. Naming inconsistente.
**Impacto:** Confusión para desarrolladores. La variable sugiere Manrope pero carga Inter.
**Recomendación:** Cambiar a `variable: "--font-inter"` y actualizar referencia en `globals.css`.
**Esfuerzo estimado:** 1h

### Hallazgo #14
**[SEVERIDAD: MEDIA]**
**Área:** UI
**Archivo(s):** `app/globals.css` (líneas 89-121)
**Descripción:** Variables CSS para dark mode definidas pero sin toggle/provider. No hay `next-themes` ni mecanismo para activar dark mode.
**Impacto:** CSS muerto si no se implementa el toggle. Esfuerzo desperdiciado en definir variables que no se usan.
**Recomendación:** Instalar `next-themes`, agregar `ThemeProvider` en `providers.tsx`, y agregar toggle en header/sidebar.
**Esfuerzo estimado:** 4h

### Hallazgo #15
**[SEVERIDAD: MEDIA]**
**Área:** i18n
**Archivo(s):** `shared/components/data-table.tsx:31`, `components/app-header.tsx`, `features/businesses/components/business-onboarding-form.tsx`
**Descripción:** Al menos 3 strings en español hardcodeados fuera del sistema de traducciones.
**Impacto:** Inconsistencia. Si se cambia el idioma, estos strings no se traducirán.
**Recomendación:** Mover a `shared/i18n/translations.ts` y usar el hook `useAppTranslator()`.
**Esfuerzo estimado:** 1h

### Hallazgo #16
**[SEVERIDAD: MEDIA]**
**Área:** DX
**Archivo(s):** Raíz del proyecto (falta `.prettierrc`)
**Descripción:** Sin Prettier configurado. Sin formatting enforced.
**Impacto:** Inconsistencia de estilo entre desarrolladores. Code reviews con ruido de formatting.
**Recomendación:** Instalar Prettier, crear `.prettierrc`, agregar script `format`. Opcionalmente agregar husky + lint-staged para pre-commit hooks.
**Esfuerzo estimado:** 1h

### Hallazgo #17
**[SEVERIDAD: MEDIA]**
**Área:** DX
**Archivo(s):** `eslint.config.mjs`
**Descripción:** ESLint configurado con solo reglas básicas de Next.js. Sin reglas de accesibilidad, performance, ni imports.
**Impacto:** No se detectan problemas de a11y, imports no usados, ni patrones de performance en desarrollo.
**Recomendación:** Agregar `eslint-plugin-jsx-a11y`, `eslint-plugin-import`, reglas de `no-console` para production builds.
**Esfuerzo estimado:** 4h

### Hallazgo #18
**[SEVERIDAD: MEDIA]**
**Área:** Seguridad
**Archivo(s):** `FACFAST_BACKEND/.env.example`
**Descripción:** `DB_SYNCHRONIZE=true` en archivo de ejemplo. Si se copia directamente a `.env`, TypeORM auto-sincronizará el schema, potencialmente destruyendo datos.
**Impacto:** Pérdida de datos si se usa en producción sin cambiar.
**Recomendación:** Cambiar a `DB_SYNCHRONIZE=false` en `.env.example`. Usar migraciones de TypeORM.
**Esfuerzo estimado:** 4h (setup de migraciones)

### Hallazgo #19
**[SEVERIDAD: MEDIA]**
**Área:** DX
**Archivo(s):** `README.md`
**Descripción:** README genérico de Next.js. Sin instrucciones de setup, variables de entorno, ni guía de contribución.
**Impacto:** Onboarding de desarrolladores lento y confuso.
**Recomendación:** Documentar: requisitos, setup local, variables de entorno, estructura del proyecto, patrones de código.
**Esfuerzo estimado:** 4h

### Hallazgo #20
**[SEVERIDAD: MEDIA]**
**Área:** Código
**Archivo(s):** Todo el frontend
**Descripción:** Sin React ErrorBoundary componente reutilizable. Solo `app/error.tsx` para errores a nivel de página.
**Impacto:** Un error en un componente de sidebar o tabla tira toda la página en vez de mostrar fallback localizado.
**Recomendación:** Crear componente `ErrorBoundary` reutilizable y envolver secciones críticas (tablas, formularios).
**Esfuerzo estimado:** 4h

### Hallazgo #21
**[SEVERIDAD: MEDIA]**
**Área:** UX
**Archivo(s):** `shared/components/data-table.tsx`, todos los page.tsx con tablas
**Descripción:** Tablas no responsive. Sin adaptación mobile (horizontal scroll sin indicador, sin card view alternativo).
**Impacto:** Tablas inutilizables en mobile (especialmente inventario con muchas columnas).
**Recomendación:** Agregar horizontal scroll indicator, o implementar card view alternativo para mobile via `useIsMobile()`.
**Esfuerzo estimado:** 1d

### Hallazgo #22
**[SEVERIDAD: MEDIA]**
**Área:** UX
**Archivo(s):** Componentes con loading states
**Descripción:** Loading states usan spinner genérico (Loader2). Sin skeleton loading (shimmer).
**Impacto:** Los usuarios ven un spinner en vez de un layout que refleja la estructura del contenido que va a cargar. Perceived performance es peor.
**Recomendación:** Implementar skeleton components para tablas, cards y formularios.
**Esfuerzo estimado:** 4h

### Hallazgo #23
**[SEVERIDAD: BAJA]**
**Área:** Arquitectura
**Archivo(s):** `app/(dashboard)/business-settings/` y `app/(dashboard)/business/`
**Descripción:** Ruta `/business-settings` parece ser legacy/deprecada. Existe junto a `/business` que maneja lo mismo.
**Impacto:** Confusión. Ruta huérfana potencial.
**Recomendación:** Verificar si `/business-settings` se usa. Si no, eliminar.
**Esfuerzo estimado:** 1h

### Hallazgo #24
**[SEVERIDAD: BAJA]**
**Área:** Performance
**Archivo(s):** `shared/lib/http.ts`
**Descripción:** Sin AbortController para cancelar requests cuando componentes se desmontan.
**Impacto:** Requests huérfanos que procesan respuestas en componentes desmontados (React warning en dev, wasted bandwidth).
**Recomendación:** Implementar signal de AbortController en React Query queries via `queryFn({ signal })`.
**Esfuerzo estimado:** 4h

### Hallazgo #25
**[SEVERIDAD: BAJA]**
**Área:** DX
**Archivo(s):** Frontend raíz (falta `.env.example`)
**Descripción:** El frontend no tiene `.env.example`. Solo `BACKEND_URL` se usa, pero no está documentado.
**Impacto:** Nuevos desarrolladores no saben qué variables configurar.
**Recomendación:** Crear `.env.example` con `BACKEND_URL=http://localhost:3002`.
**Esfuerzo estimado:** 1h

---

## Deuda Técnica (Ordenada por Prioridad)

| # | Deuda | Severidad | Esfuerzo | Hallazgo |
|---|-------|-----------|----------|----------|
| 1 | Zero tests + sin framework de testing | CRÍTICA | 3d | #1 |
| 2 | Componentes monolíticos de inventario (12 archivos, 400-866 líneas) | CRÍTICA | 1s | #2 |
| 3 | Accesibilidad a11y no cumple WCAG 2.1 AA | CRÍTICA | 3d | #3 |
| 4 | JWT secrets con defaults inseguros | ALTA | 1h | #6 |
| 5 | Sin rate limiting ni helmet/CSP en backend | ALTA | 4h | #7 |
| 6 | Cookie SameSite default `'none'` | ALTA | 1h | #8 |
| 7 | Zero memoización (useMemo/useCallback/memo) | ALTA | 1d | #4 |
| 8 | DataTable sin paginación/virtualización | ALTA | 1d | #5 |
| 9 | Sin CI/CD | ALTA | 4h | #9 |
| 10 | Sin middleware.ts de Next.js | MEDIA | 4h | #10 |
| 11 | Sin timeout en HTTP client | MEDIA | 1h | #11 |
| 12 | Sin next/image | MEDIA | 4h | #12 |
| 13 | Font naming bug | MEDIA | 1h | #13 |
| 14 | Dark mode sin toggle | MEDIA | 4h | #14 |
| 15 | Strings i18n hardcodeados | MEDIA | 1h | #15 |
| 16 | Sin Prettier | MEDIA | 1h | #16 |
| 17 | ESLint mínimo | MEDIA | 4h | #17 |
| 18 | DB_SYNCHRONIZE=true en .env.example | MEDIA | 4h | #18 |
| 19 | README genérico | MEDIA | 4h | #19 |
| 20 | Sin ErrorBoundary reutilizable | MEDIA | 4h | #20 |
| 21 | Tablas no responsive | MEDIA | 1d | #21 |
| 22 | Sin skeleton loading | MEDIA | 4h | #22 |
| 23 | Ruta legacy /business-settings | BAJA | 1h | #23 |
| 24 | Sin AbortController en requests | BAJA | 4h | #24 |
| 25 | Sin .env.example en frontend | BAJA | 1h | #25 |

---

## Roadmap Sugerido

### Fase 1 — Urgente (Primera Semana)

**Objetivo:** Cerrar vulnerabilidades de seguridad, corregir bugs y aplicar quick wins.

| Tarea | Hallazgo | Esfuerzo | Impacto |
|-------|----------|----------|---------|
| Eliminar JWT secret defaults inseguros | #6 | 1h | Seguridad crítica |
| Cambiar SameSite default a 'lax' | #8 | 1h | CSRF protection |
| Instalar helmet + configurar CSP | #7 | 2h | Headers de seguridad |
| Instalar @nestjs/throttler (rate limiting en /auth/login) | #7 | 2h | Prevenir fuerza bruta |
| Agregar timeout al HTTP client | #11 | 1h | UX: evitar spinners infinitos |
| Corregir font variable naming | #13 | 1h | Bug fix |
| Mover strings hardcodeados a i18n | #15 | 1h | Consistencia |
| Cambiar DB_SYNCHRONIZE=false en .env.example | #18 | 1h | Prevenir pérdida de datos |
| Crear .env.example en frontend | #25 | 1h | DX |
| Configurar Prettier + .prettierrc | #16 | 1h | DX |

**Total estimado: ~12 horas**

### Fase 2 — Importante (Semanas 2-3)

**Objetivo:** Mejorar arquitectura, performance y UX.

| Tarea | Hallazgo | Esfuerzo | Impacto |
|-------|----------|----------|---------|
| Agregar paginación + sorting a DataTable | #5 | 1d | Performance con datos reales |
| Agregar memoización a componentes críticos | #4 | 1d | Reducir re-renders |
| Crear middleware.ts de Next.js | #10 | 4h | Seguridad de rutas |
| Agregar accesibilidad (aria-*, focus mgmt) | #3 | 3d | WCAG compliance |
| Instalar eslint-plugin-jsx-a11y | #17 | 2h | Detectar gaps de a11y en desarrollo |
| Implementar dark mode toggle (next-themes) | #14 | 4h | Feature completa |
| Crear ErrorBoundary reutilizable | #20 | 4h | Aislamiento de errores |
| Implementar skeleton loading | #22 | 4h | Perceived performance |
| Migrar a next/image | #12 | 4h | Optimización de imágenes |
| Tablas responsive / card view mobile | #21 | 1d | UX mobile |

**Total estimado: ~10 días**

### Fase 3 — Mejora Continua (Mes 2+)

**Objetivo:** Testing, refactors profundos, CI/CD y documentación.

| Tarea | Hallazgo | Esfuerzo | Impacto |
|-------|----------|----------|---------|
| Configurar Vitest + React Testing Library | #1 | 1d | Fundación de testing |
| Escribir tests para hooks críticos (useSession, usePermissions) | #1 | 1d | Cobertura de lógica core |
| Escribir tests para formularios de auth | #1 | 1d | Cobertura de auth |
| Dividir componentes monolíticos de inventario | #2 | 1s | Mantenibilidad |
| Configurar GitHub Actions CI pipeline | #9 | 4h | Automatización |
| Agregar Dockerfile + docker-compose | #9 | 4h | Deployment consistente |
| Actualizar README con setup completo | #19 | 4h | Onboarding |
| Ampliar ESLint config (imports, no-console) | #17 | 2h | Calidad de código |
| Agregar virtualización para tablas grandes | #5 | 4h | Performance extrema |
| Implementar AbortController en queries | #24 | 4h | Cleanup de requests |
| Configurar TypeORM migraciones | #18 | 4h | Seguridad de datos |
| Eliminar ruta legacy /business-settings | #23 | 1h | Limpieza |
| Setup de E2E tests con Playwright | — | 3d | Cobertura integral |
| Agregar husky + lint-staged | #16 | 2h | Pre-commit checks |

**Total estimado: ~4 semanas**

---

## Lo Que Está Bien Hecho (Reconocimientos)

No todo es negativo. El proyecto tiene fundamentos sólidos que demuestran buen criterio técnico:

1. **Arquitectura feature-based** — Organización ejemplar. Cada feature es autocontenida con api/queries/schemas/types/components. No hay imports cruzados entre features.

2. **React Query como single source of truth** — Decisión correcta de no agregar Redux/Zustand innecesariamente. El estado del servidor vive en React Query, el estado UI vive en componentes locales.

3. **Autenticación con HttpOnly cookies** — No usar localStorage para tokens es una decisión de seguridad superior. El interceptor de refresh con mutex es elegante y previene race conditions.

4. **TypeScript strict con zero `any`** — Disciplina excepcional. Los tipos están bien inferidos de Zod schemas, y la consistencia es notable.

5. **Infraestructura de error handling** — 5 archivos dedicados que cubren parsing, mapping, presentación y toast. El patrón de mapear errores de backend a campos de formulario es production-grade.

6. **Empty/Loading/Error states** — Componentes reutilizables implementados consistentemente en toda la app. No hay estados de carga rotos.

7. **Sistema i18n establecido** — 1,352+ líneas de traducciones con hooks bien diseñados. El idioma se resuelve desde la sesión del usuario.

8. **Custom hooks bien diseñados** — `useSession`, `usePermissions`, `useActiveBranch`, `useTenantContext` encapsulan lógica compleja de forma limpia.

9. **Zero memory leaks** — Todos los useEffect con event listeners tienen cleanup correcto.

10. **Documentación de arquitectura** — 8 archivos markdown (~42 KB) que documentan decisiones, patrones y flujos. Esto es raro y valioso.

11. **Seguridad backend sólida en core** — Argon2id para passwords, refresh tokens hasheados (no plaintext), AES-256-GCM para field encryption, validación de env vars al arranque, 68 permisos RBAC granulares, guard chaining (JWT → Tenant → Permissions).

12. **Backend testing** — 16 archivos de test cubriendo auth, guards, policies y services, con e2e usando pg-mem (PostgreSQL in-memory). El frontend debería seguir este ejemplo.

---

*Fin del reporte. Ningún archivo de código fue modificado durante esta auditoría.*
