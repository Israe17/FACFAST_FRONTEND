"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";
import { CATALOG_STALE_TIME } from "@/shared/lib/query-config";

import {
  assignRolePermissions,
  createRole,
  deleteRole,
  listAvailablePermissions,
  listRoles,
  updateRole,
} from "./api";
import type {
  AssignRolePermissionsInput,
  CreateRoleInput,
  UpdateRoleInput,
} from "./types";

export const rolesKeys = {
  all: ["roles"] as const,
  list: () => [...rolesKeys.all, "list"] as const,
  permissions: () => [...rolesKeys.all, "permissions"] as const,
};

function invalidateRoleQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: rolesKeys.list() });
  queryClient.invalidateQueries({ queryKey: rolesKeys.permissions() });
}

export function useRolesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: rolesKeys.list(),
    queryFn: listRoles,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useAvailablePermissionsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: rolesKeys.permissions(),
    queryFn: listAvailablePermissions,
    staleTime: CATALOG_STALE_TIME,
  });
}

type MutationFeedbackOptions = {
  showErrorToast?: boolean;
};

export function useCreateRoleMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateRoleInput) => createRole(payload),
    onSuccess: () => {
      invalidateRoleQueries(queryClient);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("roles.create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateRoleMutation(
  roleId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: UpdateRoleInput) => updateRole(roleId, payload),
    onSuccess: () => {
      invalidateRoleQueries(queryClient);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("roles.update_error_fallback"),
        });
      }
    },
  });
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => {
      invalidateRoleQueries(queryClient);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      presentBackendErrorToast(error, {
        fallbackMessage: t("roles.delete_error_fallback"),
      });
    },
  });
}

export function useAssignRolePermissionsMutation(
  roleId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: AssignRolePermissionsInput) => assignRolePermissions(roleId, payload),
    onSuccess: () => {
      invalidateRoleQueries(queryClient);
      toast.success(t("common.saved_successfully"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("roles.permissions_update_error_fallback"),
        });
      }
    },
  });
}
