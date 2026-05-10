import type { QueryClient } from "@tanstack/react-query";

import { sessionQueryKey } from "@/features/auth/queries";
import { branchesKeys } from "@/features/branches/keys";
import { businessesKeys } from "@/features/businesses/keys";
import { contactsKeys } from "@/features/contacts/keys";
import { inventoryKeys } from "@/features/inventory/keys";
import { rolesKeys } from "@/features/roles/keys";
import { usersKeys } from "@/features/users/keys";

// Imports are taken from each feature's `keys.ts` module — not the
// `queries.ts` entry — because those modules transitively pull in
// useAppTranslator → useSession → this file. Importing from the leaf
// `keys.ts` (which has no other dependencies) breaks the cycle that
// otherwise leaves the *Keys consts in TDZ at evaluation time.
const operationalQueryKeys = [
  businessesKeys.all,
  branchesKeys.all,
  contactsKeys.all,
  inventoryKeys.all,
  rolesKeys.all,
  usersKeys.all,
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
