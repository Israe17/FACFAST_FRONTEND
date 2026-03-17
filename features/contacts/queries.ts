"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";

import {
  createContact,
  getContactById,
  listContacts,
  listContactsPaginated,
  lookupContactByIdentification,
  updateContact,
} from "./api";
import type { PaginatedQueryParams } from "./api";
import type { CreateContactInput, UpdateContactInput } from "./types";

export const contactsKeys = {
  all: ["contacts"] as const,
  detail: (contactId: string) => [...contactsKeys.all, "detail", contactId] as const,
  list: () => [...contactsKeys.all, "list"] as const,
  lookup: (identification: string) =>
    [...contactsKeys.all, "lookup", identification] as const,
};

function invalidateContactQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contactId?: string,
) {
  queryClient.invalidateQueries({ queryKey: contactsKeys.list() });

  if (contactId) {
    queryClient.invalidateQueries({ queryKey: contactsKeys.detail(contactId) });
  }
}

type MutationFeedbackOptions = {
  showErrorToast?: boolean;
};

export function useContactsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: contactsKeys.list(),
    queryFn: listContacts,
  });
}

export function useContactsPaginatedQuery(
  params: PaginatedQueryParams,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryKey: [...contactsKeys.list(), "paginated", params] as const,
    queryFn: () => listContactsPaginated(params),
    placeholderData: (prev) => prev,
  });
}

export function useContactQuery(contactId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(contactId),
    queryKey: contactsKeys.detail(contactId),
    queryFn: () => getContactById(contactId),
  });
}

export function useContactLookupQuery(identification: string, enabled = true) {
  return useQuery({
    enabled: enabled && identification.trim().length > 0,
    queryKey: contactsKeys.lookup(identification),
    queryFn: () => lookupContactByIdentification(identification),
  });
}

export function useCreateContactMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateContactInput) => createContact(payload),
    onSuccess: () => {
      invalidateContactQueries(queryClient);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("contacts.create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateContactMutation(
  contactId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: UpdateContactInput) => updateContact(contactId, payload),
    onSuccess: () => {
      invalidateContactQueries(queryClient, contactId);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("contacts.update_error_fallback"),
        });
      }
    },
  });
}
