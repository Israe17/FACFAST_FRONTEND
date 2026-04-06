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

import { createUserSchema } from "../schemas";
import { useCreateUserMutation } from "../queries";
import type { CreateUserInput } from "../types";
import { UserForm, type UserFormValues } from "./user-form";

type CreateUserDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function CreateUserDialog({ onOpenChange, open }: CreateUserDialogProps) {
  const { t } = useAppTranslator();
  const createUserMutation = useCreateUserMutation({ showErrorToast: false });

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateUserInput>({
    open,
    onOpenChange,
    schema: createUserSchema,
    defaultValues: {
      email: "",
      max_sale_discount: 0,
      name: "",
      password: "",
    },
    mutation: createUserMutation,
    fallbackErrorMessage: t("users.create_error_fallback"),
  });

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create user</DrawerTitle>
          <DrawerDescription>
            Create a new user without leaving the administrative table.
          </DrawerDescription>
        </DrawerHeader>
        <UserForm
          form={form as unknown as UseFormReturn<UserFormValues>}
          formError={formError}
          includePassword
          isPending={isPending}
          onSubmit={(values) => handleSubmit(values as CreateUserInput)}
          submitLabel="Create user"
        />
      </DrawerContent>
    </Drawer>
  );
}

export { CreateUserDialog };
