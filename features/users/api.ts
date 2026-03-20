import { http } from "@/shared/lib/http";
import { compactRecord } from "@/shared/lib/utils";

import { branchOptionSchema, effectivePermissionsSchema, userSchema } from "./schemas";
import type {
  AssignUserBranchesInput,
  AssignUserRolesInput,
  ChangeUserPasswordInput,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
} from "./types";

function extractCollection(data: unknown, explicitKey?: string) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;
  const keys = [
    explicitKey,
    "items",
    "data",
    "results",
    "users",
    "roles",
    "branches",
    "permissions",
  ];

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
  const keys = [explicitKey, "data", "item", "result", "user", "role"];

  for (const key of keys) {
    if (key && record[key] !== undefined) {
      return record[key];
    }
  }

  return data;
}

function toUniqueNumberArray(values?: string[]) {
  if (!values?.length) {
    return values;
  }

  return Array.from(new Set(values.map((value) => Number(value))));
}

function buildUserMutationPayload(payload: CreateUserInput | UpdateUserInput) {
  return compactRecord({
    allow_login: payload.allow_login,
    branch_ids: toUniqueNumberArray(payload.branch_ids),
    code: payload.code,
    email: payload.email,
    max_sale_discount: payload.max_sale_discount,
    name: payload.name,
    password: "password" in payload ? payload.password : undefined,
    role_ids: toUniqueNumberArray(payload.role_ids),
    status: payload.status,
    user_type: payload.user_type,
  });
}

export async function listUsers() {
  const response = await http.get("/users");
  return extractCollection(response.data, "users").map((user) => userSchema.parse(user));
}

export async function getUserById(userId: string) {
  const response = await http.get(`/users/${userId}`);
  return userSchema.parse(extractEntity(response.data, "user"));
}

export async function createUser(payload: CreateUserInput) {
  const response = await http.post("/users", buildUserMutationPayload(payload));
  return userSchema.parse(extractEntity(response.data, "user"));
}

export async function updateUser(userId: string, payload: UpdateUserInput) {
  const response = await http.patch(`/users/${userId}`, buildUserMutationPayload(payload));
  return userSchema.parse(extractEntity(response.data, "user"));
}

export async function updateUserStatus(userId: string, payload: UpdateUserStatusInput) {
  const response = await http.patch(
    `/users/${userId}/status`,
    compactRecord({
      allow_login: payload.allow_login,
      status: payload.status,
    }),
  );

  return userSchema.parse(extractEntity(response.data, "user"));
}

export async function changeUserPassword(userId: string, payload: ChangeUserPasswordInput) {
  await http.patch(`/users/${userId}/password`, { password: payload.password });
}

export async function assignUserRoles(userId: string, payload: AssignUserRolesInput) {
  await http.put(`/users/${userId}/roles`, {
    role_ids: toUniqueNumberArray(payload.role_ids),
  });
}

export async function assignUserBranches(userId: string, payload: AssignUserBranchesInput) {
  await http.put(`/users/${userId}/branches`, {
    branch_ids: toUniqueNumberArray(payload.branch_ids),
  });
}

export async function getUserEffectivePermissions(userId: string) {
  const response = await http.get(`/users/${userId}/effective-permissions`);
  return effectivePermissionsSchema.parse(extractEntity(response.data, "permissions") ?? response.data);
}

export async function listAssignableBranches() {
  const response = await http.get("/branches");
  return extractCollection(response.data, "branches").map((branch) =>
    branchOptionSchema.parse(branch),
  );
}

export async function deleteUser(userId: string) {
  const response = await http.delete(`/users/${userId}`);
  return extractEntity(response.data);
}
