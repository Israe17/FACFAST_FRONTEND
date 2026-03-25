import { buildBusinessOnboardingPayload } from "@/features/businesses/api";
import { http } from "@/shared/lib/http";
import { extractCollection, extractEntity } from "@/shared/lib/api-helpers";

import {
  platformBusinessBranchSchema,
  platformBusinessDetailSchema,
  platformBusinessSchema,
} from "./schemas";
import type { PlatformBusinessOnboardingInput } from "./types";

export async function listPlatformBusinesses() {
  const response = await http.get("/platform/businesses");
  return extractCollection(response.data, ["businesses"])
    .map((business) => platformBusinessSchema.parse(business))
    .filter((business) => Boolean(business.id));
}

export async function getPlatformBusinessById(businessId: string) {
  const response = await http.get(`/platform/businesses/${businessId}`);
  return platformBusinessDetailSchema.parse(extractEntity(response.data, ["business"]));
}

export async function listPlatformBusinessBranches(businessId: string) {
  const response = await http.get(`/platform/businesses/${businessId}/branches`);
  return extractCollection(response.data, ["branches"])
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
