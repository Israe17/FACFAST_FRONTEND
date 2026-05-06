"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("users.create_title")}</SheetTitle>
          <SheetDescription>{t("users.create_description")}</SheetDescription>
        </SheetHeader>
        <UserForm
          form={form as unknown as UseFormReturn<UserFormValues>}
          formError={formError}
          includePassword
          isPending={isPending}
          onSubmit={(values) => handleSubmit(values as CreateUserInput)}
          submitLabel={t("users.create_title")}
        />
      </SheetContent>
    </Sheet>
  );
}

export { CreateUserDialog };
