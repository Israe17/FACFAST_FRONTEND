import { AxiosError } from "axios";

import { createServerHttpClient, http } from "@/shared/lib/http";

import { authUserSchema } from "./schemas";
import type { AuthUser, LoginInput } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (isRecord(value)) {
    return value.id ?? value.value;
  }

  return undefined;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return value;
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (isRecord(item)) {
        const candidate = item.name ?? item.code ?? item.slug ?? item.key ?? item.id;
        return typeof candidate === "string" || typeof candidate === "number"
          ? String(candidate)
          : undefined;
      }

      return undefined;
    })
    .filter((item): item is string => Boolean(item));
}

function normalizeIdArray(value: unknown) {
  if (!Array.isArray(value)) {
    return value;
  }

  return value
    .map((item) => pickId(item))
    .filter((item): item is string | number => item !== undefined);
}

function normalizeSessionPayload(value: unknown) {
  if (!isRecord(value)) {
    return value;
  }

  return {
    ...value,
    business_id: value.business_id ?? null,
    active_business_language:
      typeof value.active_business_language === "string"
        ? value.active_business_language
        : undefined,
    roles: normalizeStringArray(value.roles),
    permissions: normalizeStringArray(value.permissions),
    branch_ids: normalizeIdArray(value.branch_ids),
    max_sale_discount: value.max_sale_discount,
    user_type: value.user_type ?? "staff",
    is_platform_admin: value.is_platform_admin ?? false,
    acting_business_id: value.acting_business_id ?? null,
    acting_branch_id: value.acting_branch_id ?? null,
    mode: value.mode ?? "tenant",
  };
}

function extractSessionPayload(data: unknown) {
  if (!isRecord(data)) {
    return data;
  }

  return data.user ?? data;
}

async function parseSession(data: unknown) {
  return authUserSchema.parse(normalizeSessionPayload(extractSessionPayload(data)));
}

export async function login(values: LoginInput) {
  const response = await http.post("/auth/login", values);
  return parseSession(response.data);
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const response = await http.get("/auth/me");
    return parseSession(response.data);
  } catch (error) {
    const status = (error as AxiosError | undefined)?.response?.status;

    if (status === 401) {
      return null;
    }

    throw error;
  }
}

export async function getServerSession(cookieHeader?: string): Promise<AuthUser | null> {
  if (!cookieHeader) {
    return null;
  }

  try {
    const client = createServerHttpClient(cookieHeader);
    const response = await client.get("/auth/me");
    return parseSession(response.data);
  } catch (error) {
    const status = (error as AxiosError | undefined)?.response?.status;

    if (status === 401) {
      return null;
    }

    throw error;
  }
}

export async function refreshSession() {
  const response = await http.post("/auth/refresh");
  return parseSession(response.data);
}

export async function logout() {
  await http.post("/auth/logout");
}
