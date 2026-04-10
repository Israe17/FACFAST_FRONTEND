import { AxiosError } from "axios";
import { z } from "zod/v4";

import { http } from "@/shared/lib/http";
import { extractCollection, extractEntity, compactRecord, compactNullableRecord } from "@/shared/lib/api-helpers";
import { paginatedSchema, type PaginatedQueryParams } from "@/shared/lib/api-types";

import { contactBranchAssignmentSchema, contactBranchContextSchema, contactSchema } from "./schemas";
import type {
  CreateContactBranchAssignmentInput,
  CreateContactInput,
  UpdateContactBranchAssignmentInput,
  UpdateContactInput,
} from "./types";

const deleteResponseSchema = z.object({
  deleted: z.boolean().optional().default(true),
  id: z.union([z.string(), z.number()]).transform(String),
});


function buildContactPayload(payload: CreateContactInput | UpdateContactInput) {
  const base = compactRecord({
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
  // Preserve null for coordinates (compactRecord strips null)
  if (payload.delivery_latitude !== undefined) base.delivery_latitude = payload.delivery_latitude;
  if (payload.delivery_longitude !== undefined) base.delivery_longitude = payload.delivery_longitude;
  return base;
}

function toOptionalNumberId(value: string | number | null | undefined, preserveNull = false) {
  if (value === "") {
    return undefined;
  }

  if (value === null) {
    return preserveNull ? null : undefined;
  }

  if (value === undefined) {
    return undefined;
  }

  return Number(value);
}

function buildContactBranchAssignmentPayload(
  payload: CreateContactBranchAssignmentInput | UpdateContactBranchAssignmentInput,
) {
  return compactNullableRecord({
    account_manager_user_id: toOptionalNumberId(payload.account_manager_user_id, true),
    branch_id: "branch_id" in payload ? toOptionalNumberId(payload.branch_id) : undefined,
    credit_enabled: payload.credit_enabled,
    custom_credit_limit: payload.custom_credit_limit,
    custom_price_list_id: toOptionalNumberId(payload.custom_price_list_id, true),
    is_active: payload.is_active,
    is_default: payload.is_default,
    is_exclusive: payload.is_exclusive,
    is_preferred: payload.is_preferred,
    notes: payload.notes === "" ? null : payload.notes,
    purchases_enabled: payload.purchases_enabled,
    sales_enabled: payload.sales_enabled,
  });
}

export async function listContacts() {
  const response = await http.get("/contacts");
  return extractCollection(response.data, ["contacts"]).map((contact) => contactSchema.parse(contact));
}

export async function getContactById(contactId: string) {
  const response = await http.get(`/contacts/${contactId}`);
  return contactSchema.parse(extractEntity(response.data, ["contact"]));
}

export async function createContact(payload: CreateContactInput) {
  await http.post("/contacts", buildContactPayload(payload));
}

export async function updateContact(contactId: string, payload: UpdateContactInput) {
  const response = await http.patch(`/contacts/${contactId}`, buildContactPayload(payload));
  return contactSchema.parse(extractEntity(response.data, ["contact"]));
}

export async function deleteContact(contactId: string) {
  const response = await http.delete(`/contacts/${contactId}`);
  return deleteResponseSchema.parse(extractEntity(response.data));
}

export async function getContactBranchContext(contactId: string) {
  const response = await http.get(`/contacts/${contactId}/branches`);
  return contactBranchContextSchema.parse(extractEntity(response.data));
}

export async function createContactBranchAssignment(
  contactId: string,
  payload: CreateContactBranchAssignmentInput,
) {
  const response = await http.post(
    `/contacts/${contactId}/branches`,
    buildContactBranchAssignmentPayload(payload),
  );
  return contactBranchAssignmentSchema.parse(
    extractEntity(response.data, ["assignment"]),
  );
}

export async function updateContactBranchAssignment(
  contactId: string,
  assignmentId: string,
  payload: UpdateContactBranchAssignmentInput,
) {
  const response = await http.patch(
    `/contacts/${contactId}/branches/${assignmentId}`,
    buildContactBranchAssignmentPayload(payload),
  );
  return contactBranchAssignmentSchema.parse(
    extractEntity(response.data, ["assignment"]),
  );
}

export async function deleteContactBranchAssignment(contactId: string, assignmentId: string) {
  const response = await http.delete(`/contacts/${contactId}/branches/${assignmentId}`);
  return deleteResponseSchema.parse(extractEntity(response.data));
}

export async function listContactsPaginated(params: PaginatedQueryParams) {
  const response = await http.get("/contacts", { params });
  return paginatedSchema(contactSchema).parse(response.data);
}

export async function lookupContactByIdentification(identification: string) {
  try {
    const response = await http.get(`/contacts/lookup/${encodeURIComponent(identification)}`);
    return contactSchema.parse(extractEntity(response.data, ["contact"]));
  } catch (error) {
    const status = (error as AxiosError | undefined)?.response?.status;

    if (status === 404) {
      return null;
    }

    throw error;
  }
}
