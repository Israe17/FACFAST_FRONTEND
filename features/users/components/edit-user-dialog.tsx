"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { updateUserSchema } from "../schemas";
import { useUpdateUserMutation, useUserQuery } from "../queries";
import type { UpdateUserInput } from "../types";
import { UserForm, type UserFormValues } from "./user-form";

type EditUserDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  userId: string;
};

function EditUserDialog({ onOpenChange, open, userId }: EditUserDialogProps) {
  const userQuery = useUserQuery(userId, open);
  const updateUserMutation = useUpdateUserMutation(userId, { showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<UpdateUserInput>({
    defaultValues: {
      email: "",
      max_sale_discount: 0,
      name: "",
    },
    resolver: buildFormResolver<UpdateUserInput>(updateUserSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (userQuery.data) {
      form.reset({
        email: userQuery.data.email,
        max_sale_discount: userQuery.data.max_sale_discount,
        name: userQuery.data.name,
      });
      resetBackendFormErrors();
    }
  }, [form, resetBackendFormErrors, userQuery.data]);

  useEffect(() => {
    if (!open) {
      resetBackendFormErrors();
    }
  }, [open, resetBackendFormErrors]);

  async function handleSubmit(values: UpdateUserInput) {
    resetBackendFormErrors();

    try {
      await updateUserMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("users.update_error_fallback"),
      });
    }
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit user</DrawerTitle>
          <DrawerDescription>Update the main information of this user.</DrawerDescription>
        </DrawerHeader>

        {userQuery.isLoading ? <LoadingState description="Loading user details." /> : null}
        {userQuery.isError ? (
          <ErrorState
            description={getTranslatedBackendErrorMessage(userQuery.error, {
              fallbackMessage: t("common.load_failed"),
              translateMessage: t,
            }) ?? undefined}
            onRetry={() => userQuery.refetch()}
          />
        ) : null}
        {userQuery.data ? (
          <UserForm
            form={form as unknown as UseFormReturn<UserFormValues>}
            formError={formError}
            isPending={updateUserMutation.isPending}
            onSubmit={(values) => handleSubmit(values as UpdateUserInput)}
            submitLabel="Save changes"
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

export { EditUserDialog };
