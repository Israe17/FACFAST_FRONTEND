import { http } from "@/shared/lib/http";
import { compactRecord } from "@/shared/lib/utils";

import { businessSchema } from "./schemas";
import type { BusinessOnboardingInput, UpdateCurrentBusinessInput } from "./types";

function extractEntity(data: unknown, explicitKey?: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return data;
  }

  const record = data as Record<string, unknown>;
  const keys = [explicitKey, "data", "item", "result", "business"];

  for (const key of keys) {
    if (key && record[key] !== undefined) {
      return record[key];
    }
  }

  return data;
}

function buildCurrentBusinessPayload(payload: UpdateCurrentBusinessInput) {
  return compactRecord({
    address: payload.address,
    canton: payload.canton,
    city: payload.city,
    code: payload.code,
    country: payload.country,
    currency_code: payload.currency_code,
    district: payload.district,
    email: payload.email,
    identification_number: payload.identification_number,
    identification_type: payload.identification_type,
    is_active: payload.is_active,
    language: payload.language,
    legal_name: payload.legal_name,
    logo_url: payload.logo_url,
    name: payload.name,
    phone: payload.phone,
    postal_code: payload.postal_code,
    province: payload.province,
    timezone: payload.timezone,
    website: payload.website,
  });
}

export function buildBusinessOnboardingPayload(payload: BusinessOnboardingInput) {
  const initialTerminal = payload.initial_terminal.create_initial_terminal
    ? compactRecord({
        create_initial_terminal: true,
        terminal_name: payload.initial_terminal.terminal_name,
        terminal_number: payload.initial_terminal.terminal_number,
      })
    : { create_initial_terminal: false };

  return {
    business: compactRecord(payload.business),
    initial_branch: compactRecord(payload.initial_branch),
    initial_terminal: initialTerminal,
    owner: compactRecord(payload.owner),
  };
}

export async function getCurrentBusiness() {
  const response = await http.get("/businesses/current");
  return businessSchema.parse(extractEntity(response.data, "business"));
}

export async function updateCurrentBusiness(payload: UpdateCurrentBusinessInput) {
  const response = await http.patch("/businesses/current", buildCurrentBusinessPayload(payload));
  return businessSchema.parse(extractEntity(response.data, "business"));
}

export async function onboardBusiness(payload: BusinessOnboardingInput) {
  const response = await http.post(
    "/platform/businesses/onboarding",
    buildBusinessOnboardingPayload(payload),
  );
  return response.data;
}
