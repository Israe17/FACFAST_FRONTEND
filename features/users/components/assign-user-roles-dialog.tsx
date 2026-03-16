"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/shared/components/action-button";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { useRolesQuery } from "@/features/roles/queries";

import { assignUserRolesSchema } from "../schemas";
import { useAssignUserRolesMutation } from "../queries";
import type { AssignUserRolesInput, User } from "../types";

type AssignUserRolesDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: User;
};

function AssignUserRolesDialog({
  onOpenChange,
  open,
  user,
}: AssignUserRolesDialogProps) {
  const rolesQuery = useRolesQuery(open);
  const assignRolesMutation = useAssignUserRolesMutation(user.id, { showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<AssignUserRolesInput>({
    defaultValues: {
      role_ids: user.roles.map((role) => role.id),
    },
    resolver: buildFormResolver<AssignUserRolesInput>(assignUserRolesSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (open) {
      form.reset({
        role_ids: user.roles.map((role) => role.id),
      });
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors, user.roles]);

  const selectedRoleIds =
    useWatch({
      control: form.control,
      name: "role_ids",
    }) ?? [];

  function toggleRole(roleId: string) {
    const nextValues = selectedRoleIds.includes(roleId)
      ? selectedRoleIds.filter((currentRoleId) => currentRoleId !== roleId)
      : [...selectedRoleIds, roleId];

    form.setValue("role_ids", nextValues, { shouldDirty: true });
  }

  async function handleSubmit(values: AssignUserRolesInput) {
    resetBackendFormErrors();

    try {
      await assignRolesMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("users.roles_update_error_fallback"),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign roles</DialogTitle>
          <DialogDescription>Update the roles assigned to {user.name}.</DialogDescription>
        </DialogHeader>

        {rolesQuery.isLoading ? <LoadingState description="Loading available roles." /> : null}
        {rolesQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(rolesQuery.error, "Unable to load roles.")}
            onRetry={() => rolesQuery.refetch()}
          />
        ) : null}
        {rolesQuery.data?.length === 0 ? (
          <EmptyState
            description="No roles are available to assign yet."
            title="No roles available"
          />
        ) : null}
        {rolesQuery.data?.length ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormErrorBanner message={formError} />

            <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-border p-4">
              {rolesQuery.data.map((role) => (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/40"
                >
                  <Checkbox
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{role.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {role.code ? `Code: ${role.code}` : `Key: ${role.role_key}`}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end">
              <ActionButton
                isLoading={assignRolesMutation.isPending}
                loadingText="Updating"
                type="submit"
              >
                Save roles
              </ActionButton>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export { AssignUserRolesDialog };
