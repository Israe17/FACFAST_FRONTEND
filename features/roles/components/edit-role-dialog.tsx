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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit role</SheetTitle>
          <SheetDescription>Update the details of this role.</SheetDescription>
        </SheetHeader>
        <RoleForm
          form={form as unknown as UseFormReturn<RoleFormValues>}
          formError={formError}
          isPending={updateRoleMutation.isPending}
          onSubmit={(values) => handleSubmit(values as UpdateRoleInput)}
          submitLabel="Save changes"
        />
      </SheetContent>
    </Sheet>
  );
}

export { EditRoleDialog };
