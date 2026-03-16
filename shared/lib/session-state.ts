import type { QueryClient } from "@tanstack/react-query";

import { sessionQueryKey } from "@/features/auth/queries";
import { branchesKeys } from "@/features/branches/queries";
import { businessesKeys } from "@/features/businesses/queries";
import { contactsKeys } from "@/features/contacts/queries";
import { inventoryKeys } from "@/features/inventory/queries";
import { rolesKeys } from "@/features/roles/queries";
import { usersKeys } from "@/features/users/queries";

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
