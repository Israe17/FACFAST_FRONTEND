export const regionsKeys = {
  all: ["regions"] as const,
  countries: () => [...regionsKeys.all, "countries"] as const,
  provinces: (countryId: number) =>
    [...regionsKeys.all, "provinces", countryId] as const,
  cantons: (provinceId: number) =>
    [...regionsKeys.all, "cantons", provinceId] as const,
  districts: (cantonId: number) =>
    [...regionsKeys.all, "districts", cantonId] as const,
};
