import { http } from "@/shared/lib/http";

import {
  permissionDefinitionSchema,
  roleSchema,
} from "./schemas";
import type {
  AssignRolePermissionsInput,
  CreateRoleInput,
  UpdateRoleInput,
} from "./types";

function extractCollection(data: unknown, explicitKey?: string) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;
  const keys = [explicitKey, "items", "data", "results", "roles", "permissions"];

  for (const key of keys) {
    if (key && Array.isArray(record[key])) {
      return record[key];
    }
  }

  return [];
}

function extractEntity(data: unknown, explicitKey?: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return data;
  }

  const record = data as Record<string, unknown>;
  const keys = [explicitKey, "data", "item", "result", "role"];

  for (const key of keys) {
    if (key && record[key] !== undefined) {
      return record[key];
    }
  }

  return data;
}

export async function listRoles() {
  const response = await http.get("/roles");
  return extractCollection(response.data, "roles").map((role) => roleSchema.parse(role));
}

export async function createRole(payload: CreateRoleInput) {
  const response = await http.post("/roles", payload);
  return roleSchema.parse(extractEntity(response.data, "role"));
}

export async function updateRole(roleId: string, payload: UpdateRoleInput) {
  const response = await http.patch(`/roles/${roleId}`, payload);
  return roleSchema.parse(extractEntity(response.data, "role"));
}

export async function deleteRole(roleId: string) {
  await http.delete(`/roles/${roleId}`);
}

export async function assignRolePermissions(
  roleId: string,
  payload: AssignRolePermissionsInput,
) {
  const response = await http.put(`/roles/${roleId}/permissions`, payload);
  return roleSchema.parse(extractEntity(response.data, "role"));
}

export async function listAvailablePermissions() {
  const response = await http.get("/permissions");
  return extractCollection(response.data, "permissions").map((permission) =>
    permissionDefinitionSchema.parse(permission),
  );
}
