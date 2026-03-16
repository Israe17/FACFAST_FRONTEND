"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { emptyTerminalFormValues } from "../form-values";
import { createTerminalSchema } from "../schemas";
import { useCreateTerminalMutation } from "../queries";
import type { CreateTerminalInput } from "../types";
import { TerminalForm, type TerminalFormValues } from "./terminal-form";

type CreateTerminalDialogProps = {
  branchId: string;
  branchName: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function CreateTerminalDialog({
  branchId,
  branchName,
  onOpenChange,
  open,
}: CreateTerminalDialogProps) {
  const createTerminalMutation = useCreateTerminalMutation(branchId, { showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<CreateTerminalInput>({
    defaultValues: emptyTerminalFormValues,
    resolver: buildFormResolver<CreateTerminalInput>(createTerminalSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (!open) {
      form.reset(emptyTerminalFormValues);
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateTerminalInput) {
    resetBackendFormErrors();

    try {
      await createTerminalMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("branches.terminal_create_error_fallback"),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create terminal</DialogTitle>
          <DialogDescription>
            Add a new terminal to {branchName}.
          </DialogDescription>
        </DialogHeader>
        <TerminalForm
          form={form as unknown as UseFormReturn<TerminalFormValues>}
          formError={formError}
          isPending={createTerminalMutation.isPending}
          onSubmit={(values) => handleSubmit(values as CreateTerminalInput)}
          submitLabel="Create terminal"
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateTerminalDialog };
