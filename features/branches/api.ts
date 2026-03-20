import { http } from "@/shared/lib/http";
import { compactRecord } from "@/shared/lib/utils";

import { branchSchema, terminalSchema } from "./schemas";
import type {
  CreateBranchInput,
  CreateTerminalInput,
  UpdateBranchInput,
  UpdateTerminalInput,
} from "./types";

function extractCollection(data: unknown, explicitKey?: string) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;
  const keys = [explicitKey, "items", "data", "results", "branches", "terminals"];

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
  const keys = [explicitKey, "data", "item", "result", "branch", "terminal"];

  for (const key of keys) {
    if (key && record[key] !== undefined) {
      return record[key];
    }
  }

  return data;
}

function buildBranchPayload(payload: CreateBranchInput | UpdateBranchInput) {
  return compactRecord({
    activity_code: payload.activity_code,
    address: payload.address,
    branch_number: payload.branch_number,
    business_name: payload.business_name,
    canton: payload.canton,
    cedula_juridica: payload.cedula_juridica,
    cert_path: payload.cert_path,
    city: payload.city,
    code: payload.code,
    crypto_key: payload.crypto_key,
    district: payload.district,
    email: payload.email,
    hacienda_password: payload.hacienda_password,
    hacienda_username: payload.hacienda_username,
    identification_number: payload.identification_number,
    identification_type: payload.identification_type,
    is_active: payload.is_active,
    legal_name: payload.legal_name,
    mail_key: payload.mail_key,
    name: payload.name,
    phone: payload.phone,
    provider_code: payload.provider_code,
    province: payload.province,
    signature_type: payload.signature_type,
  });
}

function buildTerminalPayload(payload: CreateTerminalInput | UpdateTerminalInput) {
  return compactRecord({
    code: payload.code,
    is_active: payload.is_active,
    name: payload.name,
    terminal_number: payload.terminal_number,
  });
}

export async function listBranches() {
  const response = await http.get("/branches");
  return extractCollection(response.data, "branches").map((branch) => branchSchema.parse(branch));
}

export async function getBranchById(branchId: string) {
  const response = await http.get(`/branches/${branchId}`);
  return branchSchema.parse(extractEntity(response.data, "branch"));
}

export async function createBranch(payload: CreateBranchInput) {
  const response = await http.post("/branches", buildBranchPayload(payload));
  return branchSchema.parse(extractEntity(response.data, "branch"));
}

export async function updateBranch(branchId: string, payload: UpdateBranchInput) {
  const response = await http.patch(`/branches/${branchId}`, buildBranchPayload(payload));
  return branchSchema.parse(extractEntity(response.data, "branch"));
}

export async function createTerminal(branchId: string, payload: CreateTerminalInput) {
  const response = await http.post(
    `/branches/${branchId}/terminals`,
    buildTerminalPayload(payload),
  );
  return terminalSchema.parse(extractEntity(response.data, "terminal"));
}

export async function updateTerminal(terminalId: string, payload: UpdateTerminalInput) {
  const response = await http.patch(`/terminals/${terminalId}`, buildTerminalPayload(payload));
  return terminalSchema.parse(extractEntity(response.data, "terminal"));
}

export async function deleteBranch(branchId: string) {
  const response = await http.delete(`/branches/${branchId}`);
  return extractEntity(response.data);
}

export async function deleteTerminal(terminalId: string) {
  const response = await http.delete(`/terminals/${terminalId}`);
  return extractEntity(response.data);
}
