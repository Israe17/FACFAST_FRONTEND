import type { CreateRoleInput, Role, UpdateRoleInput } from "./types";

export const emptyRoleFormValues: CreateRoleInput = {
  code: "",
  name: "",
  role_key: "",
};

export function getRoleFormValues(
  role: Pick<Role, "code" | "name" | "role_key">,
): UpdateRoleInput {
  return {
    code: role.code ?? "",
    name: role.name,
    role_key: role.role_key,
  };
}
