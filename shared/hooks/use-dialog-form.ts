"use client";

import { useEffect, useCallback } from "react";
import { useForm, type DefaultValues, type FieldValues, type UseFormReturn } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";

import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { buildFormResolver } from "@/shared/lib/form-resolver";

type UseDialogFormOptions<TInput extends FieldValues, TEntity = unknown> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: unknown;
  defaultValues: DefaultValues<TInput>;
  mutation: UseMutationResult<unknown, unknown, TInput>;
  fallbackErrorMessage: string;
  entity?: TEntity | null;
  mapEntityToForm?: (entity: TEntity) => DefaultValues<TInput>;
  transformBeforeSubmit?: (values: TInput) => TInput;
};

type UseDialogFormReturn<TInput extends FieldValues> = {
  form: UseFormReturn<TInput>;
  formError: string | null;
  isPending: boolean;
  handleSubmit: (values: TInput) => Promise<void>;
};

export function useDialogForm<TInput extends FieldValues, TEntity = unknown>({
  open,
  onOpenChange,
  schema,
  defaultValues,
  mutation,
  fallbackErrorMessage,
  entity,
  mapEntityToForm,
  transformBeforeSubmit,
}: UseDialogFormOptions<TInput, TEntity>): UseDialogFormReturn<TInput> {
  const resolvedDefaults =
    entity && mapEntityToForm ? mapEntityToForm(entity) : defaultValues;

  const form = useForm<TInput>({
    defaultValues: resolvedDefaults,
    resolver: buildFormResolver<TInput>(schema),
  });

  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    form.reset(entity && mapEntityToForm ? mapEntityToForm(entity) : defaultValues);
    resetBackendFormErrors();
  }, [open, entity]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(
    async (values: TInput) => {
      resetBackendFormErrors();

      try {
        const payload = transformBeforeSubmit ? transformBeforeSubmit(values) : values;
        await mutation.mutateAsync(payload);
        onOpenChange(false);
      } catch (error) {
        handleBackendFormError(error, { fallbackMessage: fallbackErrorMessage });
      }
    },
    [mutation, onOpenChange, fallbackErrorMessage, resetBackendFormErrors, handleBackendFormError, transformBeforeSubmit],
  );

  return {
    form,
    formError,
    isPending: mutation.isPending,
    handleSubmit,
  };
}
