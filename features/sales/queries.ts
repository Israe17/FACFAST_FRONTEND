"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { presentBackendErrorToast } from "@/shared/lib/error-presentation";

import type { CursorQueryParams, PaginatedQueryParams } from "@/shared/lib/api-types";
import { useCursorQuery } from "@/shared/hooks/use-cursor-query";

import {
  cancelSaleOrder,
  confirmSaleOrder,
  createSaleOrder,
  deleteSaleOrder,
  emitElectronicDocument,
  getElectronicDocument,
  getSaleOrder,
  listElectronicDocuments,
  listElectronicDocumentsCursor,
  listElectronicDocumentsPaginated,
  listSaleOrders,
  listSaleOrdersCursor,
  listSaleOrdersPaginated,
  updateSaleOrder,
} from "./api";
import type {
  CancelSaleOrderInput,
  CreateSaleOrderInput,
  EmitElectronicDocumentInput,
  UpdateSaleOrderInput,
} from "./types";

export const salesKeys = {
  all: ["sales"] as const,
  orders: () => [...salesKeys.all, "orders"] as const,
  ordersPaginated: (params: PaginatedQueryParams) => [...salesKeys.orders(), "paginated", params] as const,
  ordersCursor: (params: Omit<CursorQueryParams, "cursor">) => [...salesKeys.orders(), "cursor", params] as const,
  order: (orderId: string) => [...salesKeys.orders(), orderId] as const,
  documents: () => [...salesKeys.all, "documents"] as const,
  documentsPaginated: (params: PaginatedQueryParams) => [...salesKeys.documents(), "paginated", params] as const,
  documentsCursor: (params: Omit<CursorQueryParams, "cursor">) => [...salesKeys.documents(), "cursor", params] as const,
  document: (id: string) => [...salesKeys.documents(), id] as const,
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

export function useSaleOrdersPaginatedQuery(params: PaginatedQueryParams, enabled = true) {
  return useQuery({
    enabled,
    queryKey: salesKeys.ordersPaginated(params),
    queryFn: () => listSaleOrdersPaginated(params),
    placeholderData: (prev) => prev,
  });
}

export function useSaleOrdersCursorQuery(params: { search?: string; sortOrder?: "ASC" | "DESC" } = {}, enabled = true) {
  return useCursorQuery({
    queryKey: salesKeys.ordersCursor(params),
    queryFn: (cursorParams) => listSaleOrdersCursor(cursorParams),
    search: params.search,
    sortOrder: params.sortOrder,
    enabled,
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
    onSuccess: (response) => {
      if (response) {
        queryClient.setQueryData(salesKeys.order(String(response.id)), response);
      }
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
    onSuccess: (response) => {
      if (response) {
        queryClient.setQueryData(salesKeys.order(orderId), response);
      }
      invalidateSalesQueries(queryClient, [salesKeys.orders()]);
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

export function useDeleteSaleOrderMutation(
  orderId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: () => deleteSaleOrder(orderId),
    onSuccess: () => {
      invalidateSalesQueries(queryClient, [salesKeys.orders()]);
      toast.success(t("common.delete_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("sales.order_delete_error_fallback"),
        });
      }
    },
  });
}

// --- Electronic Documents ---

export function useElectronicDocumentsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: salesKeys.documents(),
    queryFn: listElectronicDocuments,
  });
}

export function useElectronicDocumentsPaginatedQuery(params: PaginatedQueryParams, enabled = true) {
  return useQuery({
    enabled,
    queryKey: salesKeys.documentsPaginated(params),
    queryFn: () => listElectronicDocumentsPaginated(params),
    placeholderData: (prev) => prev,
  });
}

export function useElectronicDocumentsCursorQuery(params: { search?: string; sortOrder?: "ASC" | "DESC" } = {}, enabled = true) {
  return useCursorQuery({
    queryKey: salesKeys.documentsCursor(params),
    queryFn: (cursorParams) => listElectronicDocumentsCursor(cursorParams),
    search: params.search,
    sortOrder: params.sortOrder,
    enabled,
  });
}

export function useElectronicDocumentQuery(id: string) {
  return useQuery({
    enabled: !!id,
    queryKey: salesKeys.document(id),
    queryFn: () => getElectronicDocument(id),
  });
}

export function useEmitElectronicDocumentMutation(options: MutationFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: EmitElectronicDocumentInput) => emitElectronicDocument(payload),
    onSuccess: () => {
      invalidateSalesQueries(queryClient, [salesKeys.documents()]);
      toast.success(t("common.create_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("sales.document_emit_error_fallback"),
        });
      }
    },
  });
}
