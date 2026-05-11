import { http } from "@/shared/lib/http";
import { extractCollection } from "@/shared/lib/api-helpers";

import {
  cantonSchema,
  countrySchema,
  districtSchema,
  provinceSchema,
} from "./types";

export async function listCountries() {
  const response = await http.get("/regions/countries");
  return extractCollection(response.data, ["countries"]).map((c) =>
    countrySchema.parse(c),
  );
}

export async function listProvinces(countryId: number) {
  const response = await http.get(
    `/regions/countries/${countryId}/provinces`,
  );
  return extractCollection(response.data, ["provinces"]).map((p) =>
    provinceSchema.parse(p),
  );
}

export async function listCantons(provinceId: number) {
  const response = await http.get(
    `/regions/provinces/${provinceId}/cantons`,
  );
  return extractCollection(response.data, ["cantons"]).map((c) =>
    cantonSchema.parse(c),
  );
}

export async function listDistricts(cantonId: number) {
  const response = await http.get(
    `/regions/cantons/${cantonId}/districts`,
  );
  return extractCollection(response.data, ["districts"]).map((d) =>
    districtSchema.parse(d),
  );
}
