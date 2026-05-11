"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { updateUserSchema } from "../schemas";
import {
  useAssignUserPermissionsMutation,
  useUpdateUserMutation,
  useUserQuery,
} from "../queries";
import type { UpdateUserInput } from "../types";
import { UserForm, type UserFormValues } from "./user-form";

type EditUserDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  userId: string;
};

type EditUserFormValues = UpdateUserInput & { permission_ids: string[] };

function EditUserDialog({ onOpenChange, open, userId }: EditUserDialogProps) {
  const userQuery = useUserQuery(userId, open);
  const updateUserMutation = useUpdateUserMutation(userId, { showErrorToast: false });
  const assignPermissionsMutation = useAssignUserPermissionsMutation(userId, {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<EditUserFormValues>({
    defaultValues: {
      email: "",
      max_sale_discount: 0,
      name: "",
      permission_ids: [],
    },
    resolver: buildFormResolver<EditUserFormValues>(
      updateUserSchema.extend({
        permission_ids: z.array(z.string()).default([]),
      }) as never,
    ),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (userQuery.data) {
      form.reset({
        email: userQuery.data.email,
        max_sale_discount: userQuery.data.max_sale_discount,
        name: userQuery.data.name,
        permission_ids: (userQuery.data.direct_permission_ids ?? []).map(String),
      });
      resetBackendFormErrors();
    }
  }, [form, resetBackendFormErrors, userQuery.data]);

  useEffect(() => {
    if (!open) {
      resetBackendFormErrors();
    }
  }, [open, resetBackendFormErrors]);

  async function handleSubmit(values: EditUserFormValues) {
    resetBackendFormErrors();
    const { permission_ids, ...userPayload } = values;
    const initialPermissionIds = (userQuery.data?.direct_permission_ids ?? [])
      .map(String)
      .sort();
    const submittedPermissionIds = [...permission_ids].sort();
    const permissionsChanged =
      initialPermissionIds.length !== submittedPermissionIds.length ||
      initialPermissionIds.some((id, index) => id !== submittedPermissionIds[index]);

    try {
      await updateUserMutation.mutateAsync(userPayload);
      if (permissionsChanged) {
        await assignPermissionsMutation.mutateAsync({ permission_ids });
      }
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("users.update_error_fallback"),
      });
    }
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("users.edit_title")}</SheetTitle>
          <SheetDescription>{t("users.edit_description")}</SheetDescription>
        </SheetHeader>

        {userQuery.isLoading ? <LoadingState description={t("users.loading_details")} /> : null}
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
            isPending={
              updateUserMutation.isPending || assignPermissionsMutation.isPending
            }
            onSubmit={(values) => handleSubmit(values as EditUserFormValues)}
            submitLabel={t("common.save_changes")}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export { EditUserDialog };
