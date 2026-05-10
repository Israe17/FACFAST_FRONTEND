export const contactsKeys = {
  all: ["contacts"] as const,
  branchContext: (contactId: string) =>
    [...contactsKeys.all, "branches", contactId] as const,
  detail: (contactId: string) =>
    [...contactsKeys.all, "detail", contactId] as const,
  list: () => [...contactsKeys.all, "list"] as const,
  lookup: (identification: string) =>
    [...contactsKeys.all, "lookup", identification] as const,
};
