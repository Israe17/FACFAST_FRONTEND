"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { sessionQueryKey } from "@/features/auth/queries";
import { useSession } from "@/shared/hooks/use-session";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";
import { rolesKeys } from "@/features/roles/queries";

import {
  assignUserBranches,
  assignUserRoles,
  changeUserPassword,
  createUser,
  deleteUser,
  getUserById,
  getUserEffectivePermissions,
  listAssignableBranches,
  listUsers,
  updateUser,
  updateUserStatus,
} from "./api";
import type {
  AssignUserBranchesInput,
  AssignUserRolesInput,
  ChangeUserPasswordInput,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
} from "./types";

export const usersKeys = {
  all: ["users"] as const,
  list: () => [...usersKeys.all, "list"] as const,
  detail: (userId: string) => [...usersKeys.all, "detail", userId] as const,
  effectivePermissions: (userId: string) =>
    [...usersKeys.all, "effective-permissions", userId] as const,
  branches: () => [...usersKeys.all, "branches"] as const,
};

function invalidateUserQueries(queryClient: ReturnType<typeof useQueryClient>, userId?: string) {
  queryClient.invalidateQueries({ queryKey: usersKeys.all });

  if (userId) {
    queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });
    queryClient.invalidateQueries({ queryKey: usersKeys.effectivePermissions(userId) });
  }
}

type MutationFeedbackOptions = {
  showErrorToast?: boolean;
};

function useShouldInvalidateCurrentSession(userId?: string) {
  const { user } = useSession();
  return Boolean(userId && user?.id === userId);
}

export function useUsersQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: usersKeys.list(),
    queryFn: listUsers,
  });
}

export function useUserQuery(userId: string, enabled = true) {
  return useQuery({
    enabled,
    queryKey: usersKeys.detail(userId),
    queryFn: () => getUserById(userId),
  });
}

export function useUserEffectivePermissionsQuery(userId: string, enabled = true) {
  return useQuery({
    enabled,
    queryKey: usersKeys.effectivePermissions(userId),
    queryFn: () => getUserEffectivePermissions(userId),
  });
}

export function useAssignableBranchesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: usersKeys.branches(),
    queryFn: listAssignableBranches,
  });
}

export function useCreateUserMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateUserInput) => createUser(payload),
    onSuccess: () => {
      invalidateUserQueries(queryClient);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("users.create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateUserMutation(userId: string, options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();
  const shouldInvalidateCurrentSession = useShouldInvalidateCurrentSession(userId);

  return useMutation({
    mutationFn: (payload: UpdateUserInput) => updateUser(userId, payload),
    onSuccess: () => {
      invalidateUserQueries(queryClient, userId);
      if (shouldInvalidateCurrentSession) {
        queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      }
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("users.update_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateUserStatusMutation(userId: string) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();
  const shouldInvalidateCurrentSession = useShouldInvalidateCurrentSession(userId);

  return useMutation({
    mutationFn: (payload: UpdateUserStatusInput) => updateUserStatus(userId, payload),
    onSuccess: () => {
      invalidateUserQueries(queryClient, userId);
      if (shouldInvalidateCurrentSession) {
        queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      }
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      presentBackendErrorToast(error, {
        fallbackMessage: t("users.status_update_error_fallback"),
      });
    },
  });
}

export function useChangeUserPasswordMutation(userId: string) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();
  const shouldInvalidateCurrentSession = useShouldInvalidateCurrentSession(userId);

  return useMutation({
    mutationFn: (payload: ChangeUserPasswordInput) => changeUserPassword(userId, payload),
    onSuccess: () => {
      invalidateUserQueries(queryClient, userId);
      if (shouldInvalidateCurrentSession) {
        queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      }
      toast.success(t("users.password_updated_success"));
    },
    onError: (error) => {
      presentBackendErrorToast(error, {
        fallbackMessage: t("users.password_update_error_fallback"),
      });
    },
  });
}

export function useAssignUserRolesMutation(
  userId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();
  const shouldInvalidateCurrentSession = useShouldInvalidateCurrentSession(userId);

  return useMutation({
    mutationFn: (payload: AssignUserRolesInput) => assignUserRoles(userId, payload),
    onSuccess: () => {
      invalidateUserQueries(queryClient, userId);
      queryClient.invalidateQueries({ queryKey: rolesKeys.list() });
      if (shouldInvalidateCurrentSession) {
        queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      }
      toast.success(t("common.saved_successfully"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("users.roles_update_error_fallback"),
        });
      }
    },
  });
}

export function useAssignUserBranchesMutation(
  userId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();
  const shouldInvalidateCurrentSession = useShouldInvalidateCurrentSession(userId);

  return useMutation({
    mutationFn: (payload: AssignUserBranchesInput) => assignUserBranches(userId, payload),
    onSuccess: () => {
      invalidateUserQueries(queryClient, userId);
      if (shouldInvalidateCurrentSession) {
        queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      }
      toast.success(t("common.saved_successfully"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("users.branches_update_error_fallback"),
        });
      }
    },
  });
}

export function useDeleteUserMutation(
  userId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();
  const shouldInvalidateCurrentSession = useShouldInvalidateCurrentSession(userId);

  return useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      invalidateUserQueries(queryClient, userId);
      if (shouldInvalidateCurrentSession) {
        queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      }
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("users.delete_error_fallback"),
        });
      }
    },
  });
}
