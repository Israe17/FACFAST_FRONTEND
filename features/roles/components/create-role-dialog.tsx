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

import { emptyRoleFormValues } from "../form-values";
import { createRoleSchema } from "../schemas";
import { useCreateRoleMutation } from "../queries";
import type { CreateRoleInput } from "../types";
import { RoleForm, type RoleFormValues } from "./role-form";

type CreateRoleDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function CreateRoleDialog({ onOpenChange, open }: CreateRoleDialogProps) {
  const { t } = useAppTranslator();

  const { form, formError, isPending, handleSubmit } = useDialogForm<CreateRoleInput>({
    open,
    onOpenChange,
    schema: createRoleSchema,
    defaultValues: emptyRoleFormValues,
    mutation: useCreateRoleMutation({ showErrorToast: false }),
    fallbackErrorMessage: t("roles.create_error_fallback"),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create role</SheetTitle>
          <SheetDescription>Create a new role for RBAC administration.</SheetDescription>
        </SheetHeader>
        <RoleForm
          form={form as unknown as UseFormReturn<RoleFormValues>}
          formError={formError}
          isPending={isPending}
          onSubmit={(values) => handleSubmit(values as CreateRoleInput)}
          submitLabel="Create role"
        />
      </SheetContent>
    </Sheet>
  );
}

export { CreateRoleDialog };
