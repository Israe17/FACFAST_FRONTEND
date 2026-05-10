export const usersKeys = {
  all: ["users"] as const,
  list: () => [...usersKeys.all, "list"] as const,
  detail: (userId: string) => [...usersKeys.all, "detail", userId] as const,
  effectivePermissions: (userId: string) =>
    [...usersKeys.all, "effective-permissions", userId] as const,
  branches: () => [...usersKeys.all, "branches"] as const,
};
