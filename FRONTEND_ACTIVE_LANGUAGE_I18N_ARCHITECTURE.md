# FRONTEND ACTIVE LANGUAGE I18N ARCHITECTURE

## Goal

Provide a lightweight frontend i18n base for success messages and frontend-controlled UX copy without changing backend contracts or introducing a heavy global i18n framework.

This phase keeps the responsibility split clear:

- Backend errors: backend already returns `error.message` translated. Frontend displays it as-is.
- Frontend success and UX copy: frontend resolves the active language and uses `t(...)`.

## Language Priority

The frontend resolves the effective language with this order:

1. `auth/me.active_business_language`
2. explicit business language passed by the current mutation flow when there is no session yet
3. fallback `es`

The browser language is not the primary source.

## Explicit Resolution By Session Mode

The active language resolution is explicitly driven by the session mode, but the source now comes from the authenticated session contract:

1. `mode = tenant`
   - use `auth/me.active_business_language`
   - backend already resolves it from the active tenant business

2. `mode = tenant_context`
   - use `auth/me.active_business_language`
   - backend already resolves it from the acting business

3. `mode = platform`
   - do not call `business/current` just to translate frontend toasts
   - use `auth/me.active_business_language` if backend provides one
   - otherwise fallback to `es`

This keeps language resolution aligned with backend instead of rebuilding that decision in frontend.

## Shared Structure

Shared files:

- `shared/i18n/language.ts`
- `shared/i18n/translations.ts`
- `shared/i18n/translator.ts`
- `shared/i18n/use-app-language.ts`
- `shared/i18n/use-app-translator.ts`

## Translation Key Design Rule

The key structure follows one explicit rule:

- use `common.*` when the text is literally interchangeable across modules
- use module-specific keys only when the event has its own identity

### Use `common.*` When

- the message is generic CRUD UX
- the same text can be reused in users, contacts, branches, roles, and future modules
- the surrounding screen or dialog already provides the missing context

Examples:

- `common.create_success`
- `common.update_success`
- `common.delete_success`
- `common.saved_successfully`
- `common.operation_completed`
- `common.load_failed`
- `common.try_again`
- `common.cancel`
- `common.save`

### Use Module-Specific Keys When

- the flow has business meaning of its own
- a generic CRUD text would hide important context
- the event is operationally distinct in the product

Examples:

- `business.update_success`
- `platform.enter_tenant_success`
- `platform.clear_tenant_success`
- `platform.business_onboarding_success`
- `users.password_updated_success`
- `contacts.lookup_empty_input`

## API

Frontend code uses a simple translator API:

```ts
const { language, t } = useAppTranslator();

toast.success(t("common.create_success"));
toast.success(t("common.update_success"));
toast.success(t("platform.enter_tenant_success"));
toast.success(t("users.password_updated_success"));
```

Pure helper usage is also available:

```ts
translate("en", "platform.enter_tenant_success");
```

## How Active Language Is Resolved

`useAppLanguage()`:

- reads the current session
- uses `auth/me.active_business_language` as the canonical active language
- normalizes locale variants like `es-CR` and `en-US`
- returns a stable app language: `es` or `en`

`business/current` is still the source of truth for business data, but it is no longer required just to know the frontend toast language.

## Avoiding Unnecessary Fetches

The frontend avoids extra requests for translation in these ways:

- `useAppLanguage()` does not call `business/current`
- tenant context success toasts reuse the refreshed session returned by `auth/me`
- platform onboarding can still resolve language from the submitted business payload before a session exists
- no separate translation endpoint is called

## Active Language Updates Across Context Changes

### When Entering `tenant_context`

1. `POST /platform/enter-business-context`
2. refresh session with `GET /auth/me`
3. read `active_business_language` from the refreshed session
4. use that language for success toasts and later frontend UX

### When Returning To `platform`

1. `POST /platform/clear-business-context`
2. cancel and clear tenant operational queries
3. refresh session back to `mode = platform`
4. stop using tenant business data for translation
5. use `active_business_language` if backend still exposes one, otherwise `es`

## Sonner Integration

Success toasts and lightweight frontend informational messages use `t(...)`.

Applied in this phase to:

- users
- contacts
- business/current
- tenant context flow
- platform onboarding
- selected fallback UX messages in tenant screens

## Backend Errors vs Frontend i18n

This boundary stays strict:

- backend errors are not translated in frontend
- frontend continues showing `error.message` from backend when available
- this i18n layer is only for success messages and frontend-controlled UX text

## Guidance For Future Modules

Practical rule for future work:

- if the message can be swapped between modules without changing meaning, use `common.*`
- if the event has product identity, use a specific module key

For new modules, do not add a second language state. Consume `auth/me.active_business_language` and use `resolveAppLanguage(...)` only when a flow needs to derive language before the session exists.
