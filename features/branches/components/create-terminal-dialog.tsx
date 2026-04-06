"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create terminal</SheetTitle>
          <SheetDescription>
            Add a new terminal to {branchName}.
          </SheetDescription>
        </SheetHeader>
        <TerminalForm
          form={form as unknown as UseFormReturn<TerminalFormValues>}
          formError={formError}
          isPending={isPending}
          onSubmit={(values) => handleSubmit(values as CreateTerminalInput)}
          submitLabel="Create terminal"
        />
      </SheetContent>
    </Sheet>
  );
}

export { CreateTerminalDialog };
