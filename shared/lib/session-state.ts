import type { QueryClient } from "@tanstack/react-query";

import { sessionQueryKey } from "@/features/auth/queries";

// Inline the root query keys for each operational domain instead of importing
// them from each feature's queries.ts. Those modules transitively import
// useAppTranslator → useSession → session-state.ts, which would re-enter this
// file before the imported `*Keys` constants are initialized (TDZ ReferenceError
// on `branchesKeys`/`contactsKeys`/etc. depending on which page is the entry).
// These literals must stay in sync with the matching `*Keys.all` definitions
// in features/{branches,businesses,contacts,inventory,roles,users}/queries.ts.
const operationalQueryKeys = [
  ["businesses"],
  ["branches"],
  ["contacts"],
  ["inventory"],
  ["roles"],
  ["users"],
] as const;

export async function resetOperationalQueries(queryClient: QueryClient) {
  await Promise.all(
    operationalQueryKeys.map((queryKey) => queryClient.cancelQueries({ queryKey })),
  );

  operationalQueryKeys.forEach((queryKey) => {
    queryClient.removeQueries({ queryKey });
  });
}

export async function clearAuthenticatedAppState(queryClient: QueryClient) {
  queryClient.setQueryData(sessionQueryKey, null);
  await queryClient.cancelQueries();
  queryClient.clear();
  queryClient.setQueryData(sessionQueryKey, null);
}
