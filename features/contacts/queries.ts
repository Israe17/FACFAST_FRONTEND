"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";
import { parseBackendError } from "@/shared/lib/backend-error-parser";

import {
  createContactBranchAssignment,
  createContact,
  deleteContactBranchAssignment,
  deleteContact,
  getContactBranchContext,
  getContactById,
  listContacts,
  listContactsPaginated,
  lookupContactByIdentification,
  updateContactBranchAssignment,
  updateContact,
} from "./api";
import type { PaginatedQueryParams } from "@/shared/lib/api-types";
import type {
  CreateContactBranchAssignmentInput,
  CreateContactInput,
  UpdateContactBranchAssignmentInput,
  UpdateContactInput,
} from "./types";

export const contactsKeys = {
  all: ["contacts"] as const,
  branchContext: (contactId: string) => [...contactsKeys.all, "branches", contactId] as const,
  detail: (contactId: string) => [...contactsKeys.all, "detail", contactId] as const,
  list: () => [...contactsKeys.all, "list"] as const,
  lookup: (identification: string) =>
    [...contactsKeys.all, "lookup", identification] as const,
};

function getContactDeleteDependencySummary(error: unknown, t: ReturnType<typeof useAppTranslator>["t"]) {
  const backendError = parseBackendError(error);

  if (backendError?.code !== "CONTACT_DELETE_FORBIDDEN") {
    return null;
  }

  const details = backendError.details;

  if (
    !details ||
    typeof details !== "object" ||
    Array.isArray(details) ||
    !("dependencies" in details) ||
    !details.dependencies ||
    typeof details.dependencies !== "object" ||
    Array.isArray(details.dependencies)
  ) {
    return t("contacts.delete_forbidden");
  }

  const dependencyLabels: Record<string, string> = {
    inventory_lots: t("contacts.dependency.inventory_lots"),
    serial_events: t("contacts.dependency.serial_events"),
  };

  const summary = Object.entries(details.dependencies as Record<string, unknown>)
    .filter(([, count]) => typeof count === "number" && count > 0)
    .map(([dependency, count]) => `${dependencyLabels[dependency] ?? dependency} (${count})`)
    .join(", ");

  return summary
    ? t("contacts.delete_forbidden_dependencies", { dependencies: summary })
    : t("contacts.delete_forbidden");
}

function invalidateContactQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contactId?: string,
) {
  queryClient.invalidateQueries({ queryKey: contactsKeys.all });

  if (contactId) {
    queryClient.invalidateQueries({ queryKey: contactsKeys.detail(contactId) });
    queryClient.invalidateQueries({ queryKey: contactsKeys.branchContext(contactId) });
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
    staleTime: 10 * 60 * 1000,
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

export function useContactBranchContextQuery(contactId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(contactId),
    queryKey: contactsKeys.branchContext(contactId),
    queryFn: () => getContactBranchContext(contactId),
  });
}

export function useDeleteContactMutation(
  contactId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: () => deleteContact(contactId),
    onSuccess: () => {
      invalidateContactQueries(queryClient, contactId);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        const dependencyMessage = getContactDeleteDependencySummary(error, t);

        if (dependencyMessage) {
          toast.error(dependencyMessage);
          return;
        }

        presentBackendErrorToast(error, {
          fallbackMessage: t("contacts.delete_error_fallback"),
        });
      }
    },
  });
}

export function useCreateContactBranchAssignmentMutation(
  contactId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateContactBranchAssignmentInput) =>
      createContactBranchAssignment(contactId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.detail(contactId) });
      queryClient.invalidateQueries({ queryKey: contactsKeys.branchContext(contactId) });
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("contacts.branch_assignment_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateContactBranchAssignmentMutation(
  contactId: string,
  assignmentId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: UpdateContactBranchAssignmentInput) =>
      updateContactBranchAssignment(contactId, assignmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.detail(contactId) });
      queryClient.invalidateQueries({ queryKey: contactsKeys.branchContext(contactId) });
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("contacts.branch_assignment_update_error_fallback"),
        });
      }
    },
  });
}

export function useDeleteContactBranchAssignmentMutation(
  contactId: string,
  assignmentId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: () => deleteContactBranchAssignment(contactId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.detail(contactId) });
      queryClient.invalidateQueries({ queryKey: contactsKeys.branchContext(contactId) });
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("contacts.branch_assignment_delete_error_fallback"),
        });
      }
    },
  });
}
