"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { getTerminalFormValues } from "../form-values";
import { updateTerminalSchema } from "../schemas";
import { useUpdateTerminalMutation } from "../queries";
import type { Terminal, UpdateTerminalInput } from "../types";
import { TerminalForm, type TerminalFormValues } from "./terminal-form";

type EditTerminalDialogProps = {
  branchId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  terminal: Terminal;
};

function EditTerminalDialog({
  branchId,
  onOpenChange,
  open,
  terminal,
}: EditTerminalDialogProps) {
  const updateTerminalMutation = useUpdateTerminalMutation(branchId, terminal.id, {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<UpdateTerminalInput>({
    defaultValues: getTerminalFormValues(terminal),
    resolver: buildFormResolver<UpdateTerminalInput>(updateTerminalSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (open) {
      form.reset(getTerminalFormValues(terminal));
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors, terminal]);

  async function handleSubmit(values: UpdateTerminalInput) {
    resetBackendFormErrors();

    try {
      await updateTerminalMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("branches.terminal_update_error_fallback"),
      });
    }
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit terminal</SheetTitle>
          <SheetDescription>
            Update the terminal configuration for this branch.
          </SheetDescription>
        </SheetHeader>
        <TerminalForm
          form={form as unknown as UseFormReturn<TerminalFormValues>}
          formError={formError}
          isPending={updateTerminalMutation.isPending}
          onSubmit={(values) => handleSubmit(values as UpdateTerminalInput)}
          submitLabel="Save changes"
        />
      </SheetContent>
    </Sheet>
  );
}

export { EditTerminalDialog };
