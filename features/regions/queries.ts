import { useQuery } from "@tanstack/react-query";

import {
  listCantons,
  listCountries,
  listDistricts,
  listProvinces,
} from "./api";
import { regionsKeys } from "./keys";

const STATIC_QUERY_OPTIONS = {
  staleTime: Infinity,
  retry: false as const,
};

export function useCountriesQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: regionsKeys.countries(),
    queryFn: listCountries,
    enabled,
    ...STATIC_QUERY_OPTIONS,
  });
}

export function useProvincesQuery(countryId: number | null | undefined) {
  return useQuery({
    queryKey: regionsKeys.provinces(countryId ?? 0),
    queryFn: () => listProvinces(countryId as number),
    enabled: countryId != null && countryId > 0,
    ...STATIC_QUERY_OPTIONS,
  });
}

export function useCantonsQuery(provinceId: number | null | undefined) {
  return useQuery({
    queryKey: regionsKeys.cantons(provinceId ?? 0),
    queryFn: () => listCantons(provinceId as number),
    enabled: provinceId != null && provinceId > 0,
    ...STATIC_QUERY_OPTIONS,
  });
}

export function useDistrictsQuery(cantonId: number | null | undefined) {
  return useQuery({
    queryKey: regionsKeys.districts(cantonId ?? 0),
    queryFn: () => listDistricts(cantonId as number),
    enabled: cantonId != null && cantonId > 0,
    ...STATIC_QUERY_OPTIONS,
  });
}
