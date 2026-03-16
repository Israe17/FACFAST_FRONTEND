export const businessesKeys = {
  all: ["businesses"] as const,
  current: () => [...businessesKeys.all, "current"] as const,
};
