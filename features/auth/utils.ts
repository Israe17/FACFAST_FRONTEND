import { APP_ROUTES } from "@/shared/lib/routes";

import type { AuthUser } from "./types";

export function isPlatformMode(session?: AuthUser | null) {
  return session?.mode === "platform";
}

export function isTenantContextMode(session?: AuthUser | null) {
  return session?.mode === "tenant_context";
}

export function isTenantContextPlatformAdmin(session?: AuthUser | null) {
  return Boolean(session?.is_platform_admin && isTenantContextMode(session));
}

export function isTenantMode(session?: AuthUser | null) {
  return session?.mode === "tenant";
}

export function hasTenantOperationalAccess(session?: AuthUser | null) {
  return isTenantMode(session) || isTenantContextMode(session);
}

export function getOperationalBusinessId(session?: AuthUser | null) {
  if (!session) {
    return null;
  }

  if (isTenantContextMode(session)) {
    return session.acting_business_id ?? session.business_id ?? null;
  }

  if (isTenantMode(session)) {
    return session.business_id ?? null;
  }

  return null;
}

export function getLandingRoute(session?: AuthUser | null) {
  if (!session) {
    return APP_ROUTES.login;
  }

  if (session.is_platform_admin && isPlatformMode(session)) {
    return APP_ROUTES.superadminEnterContext;
  }

  if (isTenantContextPlatformAdmin(session)) {
    return APP_ROUTES.business;
  }

  return APP_ROUTES.dashboard;
}
