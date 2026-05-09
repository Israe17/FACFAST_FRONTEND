import type { CreateRoleInput, Role, UpdateRoleInput } from "./types";

export const emptyRoleFormValues: CreateRoleInput = {
  name: "",
  role_key: "",
};

export function getRoleFormValues(
  role: Pick<Role, "name" | "role_key">,
): UpdateRoleInput {
  return {
    name: role.name,
    role_key: role.role_key,
  };
}
