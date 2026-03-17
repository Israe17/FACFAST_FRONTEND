"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";

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
  const { t } = useAppTranslator();

  const { form, formError, isPending, handleSubmit } = useDialogForm<CreateTerminalInput>({
    open,
    onOpenChange,
    schema: createTerminalSchema,
    defaultValues: emptyTerminalFormValues,
    mutation: useCreateTerminalMutation(branchId, { showErrorToast: false }),
    fallbackErrorMessage: t("branches.terminal_create_error_fallback"),
  });

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
          isPending={isPending}
          onSubmit={(values) => handleSubmit(values as CreateTerminalInput)}
          submitLabel="Create terminal"
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateTerminalDialog };
