import { getCurrentBusiness } from "./api";
import { businessesKeys } from "./keys";

export function getCurrentBusinessQueryOptions(enabled = true) {
  return {
    enabled,
    queryFn: getCurrentBusiness,
    queryKey: businessesKeys.current(),
  };
}
