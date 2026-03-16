# FRONTEND ERROR CONSUMPTION ARCHITECTURE

## Objetivo

Consumir en frontend la infraestructura estandarizada de errores del backend sin duplicar parsing por feature y sin mezclar responsabilidades entre formularios, banners y toasts.

Esta fase cubre inicialmente:

- `users`
- `contacts`
- `business/current`

No cambia contratos del backend ni agrega endpoints nuevos.

## BackendError

El frontend normaliza los errores backend hacia un tipo compartido:

```ts
type BackendError = {
  statusCode: number;
  error: string;
  code: string;
  messageKey?: string;
  message: string;
  details?: unknown;
  path?: string;
  timestamp?: string;
  requestId?: string;
};
```

La fuente de verdad es el payload devuelto por backend. Si Axios entrega un error parcial o un error inesperado, el parser completa un `BackendError` razonable para que la UI tenga un contrato estable.

## Parsing global

La capa shared queda separada asi:

- `shared/lib/api-error.ts`
  - tipos base y type guards del shape backend
- `shared/lib/backend-error-parser.ts`
  - extrae `BackendError` desde Axios o errores runtime
  - detecta `VALIDATION_ERROR`
  - detecta errores inesperados
  - extrae `field errors`
- `shared/lib/form-error-mapper.ts`
  - aplica errores backend a React Hook Form usando `setError`
- `shared/lib/error-presentation.ts`
  - decide cuando conviene banner vs toast
- `shared/hooks/use-backend-form-errors.ts`
  - integra parser + mapper + presentacion para formularios

Con esto evitamos parsear `response.data.message` distinto en cada pantalla.

## Mapping a formularios

La integracion reusable es:

```ts
applyBackendErrorsToForm(error, setError)
```

`fieldNameMap` sigue existiendo, pero ahora es opcional y debe usarse solo cuando el nombre del campo visual realmente difiere del DTO backend. Si el formulario ya usa los nombres exactos del API, no hace falta ningun mapa local.

Reglas:

- `VALIDATION_ERROR` con `details[]`
  - cada `detail.field` se mapea al input correspondiente
  - el mensaje se muestra debajo del campo
- error de negocio con `details.field`
  - si el field existe, se marca ese input
- error de negocio sin field
  - se resuelve como error general de formulario
- error inesperado
  - genera banner general y toast

El hook `useBackendFormErrors` encapsula esta secuencia para no repetir `setError`, `setState` y `toast.error(...)` en cada componente.

## Banner vs Toast vs Field Error

Convencion de UX:

- Field error
  - validaciones DTO y conflictos con `details.field`
  - prioridad maxima dentro del formulario
- Form banner
  - errores generales del formulario
  - conflictos de negocio no asociados claramente a un campo
  - errores inesperados en pantallas con formulario visible
- Toast
  - acciones sin formulario visible
  - errores inesperados
  - mutaciones donde no existe un contexto de formulario para marcar inputs

Para evitar ruido:

- si ya hubo mapping de campos, no se muestra toast generico por defecto
- si el error es inesperado, se permite banner + toast

## Modulos aplicados en esta fase

### Users

- `create user`
- `edit user`
- mensajes de carga de listas y detalle usando parser compartido

### Contacts

- `create contact`
- `edit contact`
- mensajes de listas, lookup y detalle usando parser compartido

### Business Current

- `updateCurrentBusiness`
- estado de error de `GET /businesses/current` usando parser compartido

## Impacto en queries y mutaciones

Las mutaciones de formulario aceptan la posibilidad de desactivar el toast generico de error (`showErrorToast: false`) para que la pantalla visible sea quien presente correctamente:

- errores de campo
- banner general
- toast solo cuando corresponde

Esto evita duplicados como:

- toast generico
- banner general
- y errores debajo de inputs al mismo tiempo

## Que queda fuera de esta fase

- refactor total del resto de features del proyecto
- i18n completo de frontend
- analytics u observabilidad de errores
- politicas avanzadas de retry segun `code`
- UI dedicada para request tracing o soporte de `requestId`

La base queda lista para extender el mismo patron a `roles`, `branches`, `platform businesses`, `auth` y otras features sin volver a inventar parsing local.
