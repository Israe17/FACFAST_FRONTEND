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

import { createUserSchema } from "../schemas";
import { useCreateUserMutation } from "../queries";
import type { CreateUserInput } from "../types";
import { UserForm, type UserFormValues } from "./user-form";

type CreateUserDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function CreateUserDialog({ onOpenChange, open }: CreateUserDialogProps) {
  const createUserMutation = useCreateUserMutation({ showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<CreateUserInput>({
    defaultValues: {
      email: "",
      max_sale_discount: 0,
      name: "",
      password: "",
    },
    resolver: buildFormResolver<CreateUserInput>(createUserSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (!open) {
      form.reset({
        email: "",
        max_sale_discount: 0,
        name: "",
        password: "",
      });
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateUserInput) {
    resetBackendFormErrors();

    try {
      await createUserMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("users.create_error_fallback"),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Create a new user without leaving the administrative table.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          form={form as unknown as UseFormReturn<UserFormValues>}
          formError={formError}
          includePassword
          isPending={createUserMutation.isPending}
          onSubmit={(values) => handleSubmit(values as CreateUserInput)}
          submitLabel="Create user"
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateUserDialog };
