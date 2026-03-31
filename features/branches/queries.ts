"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";
import { parseBackendError } from "@/shared/lib/backend-error-parser";
import { usersKeys } from "@/features/users/queries";

import {
  createBranch,
  createTerminal,
  deleteBranch,
  deleteTerminal,
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
  queryClient.invalidateQueries({ queryKey: branchesKeys.all });
  queryClient.invalidateQueries({ queryKey: usersKeys.branches() });

  if (branchId) {
    queryClient.invalidateQueries({ queryKey: branchesKeys.detail(branchId) });
  }
}

function getBranchDeleteDependencySummary(error: unknown, t: ReturnType<typeof useAppTranslator>["t"]) {
  const backendError = parseBackendError(error);

  if (backendError?.code !== "BRANCH_DELETE_FORBIDDEN") {
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
    return t("branches.delete_forbidden");
  }

  const dependencyLabels: Record<string, string> = {
    inventory_lots: t("branches.dependency.inventory_lots"),
    inventory_movement_headers: t("branches.dependency.inventory_movement_headers"),
    inventory_movements: t("branches.dependency.inventory_movements"),
    warehouse_branch_links: t("branches.dependency.warehouse_branch_links"),
    warehouse_locations: t("branches.dependency.warehouse_locations"),
    warehouse_stock: t("branches.dependency.warehouse_stock"),
    warehouses: t("branches.dependency.warehouses"),
  };

  const summary = Object.entries(details.dependencies as Record<string, unknown>)
    .filter(([, count]) => typeof count === "number" && count > 0)
    .map(([dependency, count]) => `${dependencyLabels[dependency] ?? dependency} (${count})`)
    .join(", ");

  return summary
    ? t("branches.delete_forbidden_dependencies", { dependencies: summary })
    : t("branches.delete_forbidden");
}

export function useBranchesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: branchesKeys.list(),
    queryFn: listBranches,
    staleTime: 10 * 60 * 1000,
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

export function useDeleteBranchMutation(
  branchId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: () => deleteBranch(branchId),
    onSuccess: () => {
      invalidateBranchQueries(queryClient, branchId);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        const branchDeleteMessage = getBranchDeleteDependencySummary(error, t);

        if (branchDeleteMessage) {
          toast.error(branchDeleteMessage);
          return;
        }

        presentBackendErrorToast(error, {
          fallbackMessage: t("branches.delete_error_fallback"),
        });
      }
    },
  });
}

export function useDeleteTerminalMutation(
  branchId: string,
  terminalId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: () => deleteTerminal(terminalId),
    onSuccess: () => {
      invalidateBranchQueries(queryClient, branchId);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("branches.terminal_delete_error_fallback"),
        });
      }
    },
  });
}
