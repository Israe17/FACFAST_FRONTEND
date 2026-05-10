export const branchesKeys = {
  all: ["branches"] as const,
  detail: (branchId: string) => [...branchesKeys.all, "detail", branchId] as const,
  list: () => [...branchesKeys.all, "list"] as const,
};
