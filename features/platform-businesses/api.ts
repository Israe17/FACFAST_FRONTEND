import { buildBusinessOnboardingPayload } from "@/features/businesses/api";
import { http } from "@/shared/lib/http";

import {
  platformBusinessBranchSchema,
  platformBusinessDetailSchema,
  platformBusinessSchema,
} from "./schemas";
import type { PlatformBusinessOnboardingInput } from "./types";

function extractCollection(data: unknown, explicitKey?: string) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;
  const keys = [explicitKey, "items", "data", "results", "businesses", "branches"];

  for (const key of keys) {
    if (key && Array.isArray(record[key])) {
      return record[key];
    }
  }

  return [];
}

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

export async function listPlatformBusinesses() {
  const response = await http.get("/platform/businesses");
  return extractCollection(response.data, "businesses")
    .map((business) => platformBusinessSchema.parse(business))
    .filter((business) => Boolean(business.id));
}

export async function getPlatformBusinessById(businessId: string) {
  const response = await http.get(`/platform/businesses/${businessId}`);
  return platformBusinessDetailSchema.parse(extractEntity(response.data, "business"));
}

export async function listPlatformBusinessBranches(businessId: string) {
  const response = await http.get(`/platform/businesses/${businessId}/branches`);
  return extractCollection(response.data, "branches")
    .map((branch) => platformBusinessBranchSchema.parse(branch))
    .filter((branch) => Boolean(branch.id));
}

export async function createPlatformBusinessOnboarding(
  payload: PlatformBusinessOnboardingInput,
) {
  const response = await http.post(
    "/platform/businesses/onboarding",
    buildBusinessOnboardingPayload(payload),
  );

  return response.data;
}
