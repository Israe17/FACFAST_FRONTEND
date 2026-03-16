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
  const createRoleMutation = useCreateRoleMutation({ showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<CreateRoleInput>({
    defaultValues: emptyRoleFormValues,
    resolver: buildFormResolver<CreateRoleInput>(createRoleSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (!open) {
      form.reset(emptyRoleFormValues);
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateRoleInput) {
    resetBackendFormErrors();

    try {
      await createRoleMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("roles.create_error_fallback"),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>Create a new role for RBAC administration.</DialogDescription>
        </DialogHeader>
        <RoleForm
          form={form as unknown as UseFormReturn<RoleFormValues>}
          formError={formError}
          isPending={createRoleMutation.isPending}
          onSubmit={(values) => handleSubmit(values as CreateRoleInput)}
          submitLabel="Create role"
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateRoleDialog };
