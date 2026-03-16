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

import { getRoleFormValues } from "../form-values";
import { updateRoleSchema } from "../schemas";
import { useUpdateRoleMutation } from "../queries";
import type { Role, UpdateRoleInput } from "../types";
import { RoleForm, type RoleFormValues } from "./role-form";

type EditRoleDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  role: Role;
};

function EditRoleDialog({ onOpenChange, open, role }: EditRoleDialogProps) {
  const updateRoleMutation = useUpdateRoleMutation(role.id, { showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<UpdateRoleInput>({
    defaultValues: getRoleFormValues(role),
    resolver: buildFormResolver<UpdateRoleInput>(updateRoleSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (open) {
      form.reset(getRoleFormValues(role));
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors, role]);

  async function handleSubmit(values: UpdateRoleInput) {
    resetBackendFormErrors();

    try {
      await updateRoleMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("roles.update_error_fallback"),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit role</DialogTitle>
          <DialogDescription>Update the details of this role.</DialogDescription>
        </DialogHeader>
        <RoleForm
          form={form as unknown as UseFormReturn<RoleFormValues>}
          formError={formError}
          isPending={updateRoleMutation.isPending}
          onSubmit={(values) => handleSubmit(values as UpdateRoleInput)}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
}

export { EditRoleDialog };
