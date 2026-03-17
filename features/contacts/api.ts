import { AxiosError } from "axios";

import { http } from "@/shared/lib/http";

import { contactSchema } from "./schemas";
import type { CreateContactInput, UpdateContactInput } from "./types";

function extractCollection(data: unknown, explicitKey?: string) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;
  const keys = [explicitKey, "items", "data", "results", "contacts"];

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
  const keys = [explicitKey, "data", "item", "result", "contact"];

  for (const key of keys) {
    if (key && record[key] !== undefined) {
      return record[key];
    }
  }

  return data;
}

function compactRecord<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function buildContactPayload(payload: CreateContactInput | UpdateContactInput) {
  return compactRecord({
    address: payload.address,
    canton: payload.canton,
    code: payload.code,
    commercial_name: payload.commercial_name,
    district: payload.district,
    economic_activity_code: payload.economic_activity_code,
    email: payload.email,
    exoneration_document_number: payload.exoneration_document_number,
    exoneration_institution: payload.exoneration_institution,
    exoneration_issue_date: payload.exoneration_issue_date,
    exoneration_percentage: payload.exoneration_percentage,
    exoneration_type: payload.exoneration_type,
    identification_number: payload.identification_number,
    identification_type: payload.identification_type,
    is_active: payload.is_active,
    name: payload.name,
    phone: payload.phone,
    province: payload.province,
    tax_condition: payload.tax_condition,
    type: payload.type,
  });
}

export async function listContacts() {
  const response = await http.get("/contacts");
  return extractCollection(response.data, "contacts").map((contact) => contactSchema.parse(contact));
}

export async function getContactById(contactId: string) {
  const response = await http.get(`/contacts/${contactId}`);
  return contactSchema.parse(extractEntity(response.data, "contact"));
}

export async function createContact(payload: CreateContactInput) {
  await http.post("/contacts", buildContactPayload(payload));
}

export async function updateContact(contactId: string, payload: UpdateContactInput) {
  await http.patch(`/contacts/${contactId}`, buildContactPayload(payload));
}

export type PaginatedQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export async function listContactsPaginated(
  params: PaginatedQueryParams,
): Promise<PaginatedResponse<ReturnType<typeof contactSchema.parse>>> {
  const response = await http.get("/contacts", { params });
  const raw = response.data;
  return {
    data: extractCollection(raw, "contacts").map((contact) => contactSchema.parse(contact)),
    total: raw?.total ?? 0,
    page: raw?.page ?? 1,
    limit: raw?.limit ?? 20,
    total_pages: raw?.total_pages ?? 1,
  };
}

export async function lookupContactByIdentification(identification: string) {
  try {
    const response = await http.get(`/contacts/lookup/${encodeURIComponent(identification)}`);
    return contactSchema.parse(extractEntity(response.data, "contact"));
  } catch (error) {
    const status = (error as AxiosError | undefined)?.response?.status;

    if (status === 404) {
      return null;
    }

    throw error;
  }
}
