"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";

import {
  cancelSaleOrder,
  confirmSaleOrder,
  createSaleOrder,
  getSaleOrder,
  listSaleOrders,
  updateSaleOrder,
} from "./api";
import type {
  CancelSaleOrderInput,
  CreateSaleOrderInput,
  UpdateSaleOrderInput,
} from "./types";

export const salesKeys = {
  all: ["sales"] as const,
  orders: () => [...salesKeys.all, "orders"] as const,
  order: (orderId: string) => [...salesKeys.orders(), orderId] as const,
};

type MutationFeedbackOptions = {
  showErrorToast?: boolean;
};

function invalidateSalesQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKeys: readonly (readonly unknown[])[],
) {
  queryKeys.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
}

export function useSaleOrdersQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: salesKeys.orders(),
    queryFn: listSaleOrders,
  });
}

export function useSaleOrderQuery(orderId: string) {
  return useQuery({
    enabled: !!orderId,
    queryKey: salesKeys.order(orderId),
    queryFn: () => getSaleOrder(orderId),
  });
}

export function useCreateSaleOrderMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CreateSaleOrderInput) => createSaleOrder(payload),
    onSuccess: () => {
      invalidateSalesQueries(queryClient, [salesKeys.orders()]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("sales.order_create_error_fallback"),
        });
      }
    },
  });
}

export function useUpdateSaleOrderMutation(
  orderId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: UpdateSaleOrderInput) => updateSaleOrder(orderId, payload),
    onSuccess: () => {
      invalidateSalesQueries(queryClient, [salesKeys.orders(), salesKeys.order(orderId)]);
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("sales.order_update_error_fallback"),
        });
      }
    },
  });
}

export function useConfirmSaleOrderMutation(
  orderId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: () => confirmSaleOrder(orderId),
    onSuccess: () => {
      invalidateSalesQueries(queryClient, [salesKeys.orders(), salesKeys.order(orderId)]);
      toast.success(t("common.confirm_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("sales.order_confirm_error_fallback"),
        });
      }
    },
  });
}

export function useCancelSaleOrderMutation(
  orderId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: CancelSaleOrderInput) => cancelSaleOrder(orderId, payload),
    onSuccess: () => {
      invalidateSalesQueries(queryClient, [salesKeys.orders(), salesKeys.order(orderId)]);
      toast.success(t("common.cancel_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("sales.order_cancel_error_fallback"),
        });
      }
    },
  });
}
