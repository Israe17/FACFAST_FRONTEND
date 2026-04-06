"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create terminal</DrawerTitle>
          <DrawerDescription>
            Add a new terminal to {branchName}.
          </DrawerDescription>
        </DrawerHeader>
        <TerminalForm
          form={form as unknown as UseFormReturn<TerminalFormValues>}
          formError={formError}
          isPending={isPending}
          onSubmit={(values) => handleSubmit(values as CreateTerminalInput)}
          submitLabel="Create terminal"
        />
      </DrawerContent>
    </Drawer>
  );
}

export { CreateTerminalDialog };
