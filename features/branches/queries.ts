"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";

import {
  createBranch,
  createTerminal,
  getBranchById,
  listBranches,
  updateBranch,
  updateTerminal,
} from "./api";
import type {
  CreateBranchInput,
  CreateTerminalInput,
  UpdateBranchInput,
  UpdateTerminalInput,
} from "./types";

export const branchesKeys = {
  all: ["branches"] as const,
  detail: (branchId: string) => [...branchesKeys.all, "detail", branchId] as const,
  list: () => [...branchesKeys.all, "list"] as const,
};

function invalidateBranchQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  branchId?: string,
) {
  queryClient.invalidateQueries({ queryKey: branchesKeys.list() });

  if (branchId) {
    queryClient.invalidateQueries({ queryKey: branchesKeys.detail(branchId) });
  }
}

export function useBranchesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: branchesKeys.list(),
    queryFn: listBranches,
  });
}

export function useBranchQuery(branchId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(branchId),
    queryKey: branchesKeys.detail(branchId),
    queryFn: () => getBranchById(branchId),
  });
}

type MutationFeedbackOptions = {
  showErrorToast?: boolean;
};

export function useCreateBranchMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateBranchInput) => createBranch(payload),
    onSuccess: () => {
      invalidateBranchQueries(queryClient);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("branches.create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateBranchMutation(
  branchId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: UpdateBranchInput) => updateBranch(branchId, payload),
    onSuccess: () => {
      invalidateBranchQueries(queryClient, branchId);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("branches.update_error_fallback"),
        });
      }
    },
  });
}

export function useCreateTerminalMutation(
  branchId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateTerminalInput) => createTerminal(branchId, payload),
    onSuccess: () => {
      invalidateBranchQueries(queryClient, branchId);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("branches.terminal_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateTerminalMutation(
  branchId: string,
  terminalId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: UpdateTerminalInput) => updateTerminal(terminalId, payload),
    onSuccess: () => {
      invalidateBranchQueries(queryClient, branchId);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("branches.terminal_update_error_fallback"),
        });
      }
    },
  });
}
