"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ActionButton } from "@/shared/components/action-button";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { assignRolePermissionsSchema } from "../schemas";
import {
  useAssignRolePermissionsMutation,
  useAvailablePermissionsQuery,
} from "../queries";
import type { AssignRolePermissionsInput, Role } from "../types";

type AssignRolePermissionsDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  role: Role;
};

function AssignRolePermissionsDialog({
  onOpenChange,
  open,
  role,
}: AssignRolePermissionsDialogProps) {
  const permissionsQuery = useAvailablePermissionsQuery(open);
  const assignPermissionsMutation = useAssignRolePermissionsMutation(role.id, {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<AssignRolePermissionsInput>({
    defaultValues: {
      permission_ids: role.permissions.map((permission) => permission.id),
    },
    resolver: buildFormResolver<AssignRolePermissionsInput>(assignRolePermissionsSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (open) {
      form.reset({
        permission_ids: role.permissions.map((permission) => permission.id),
      });
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors, role.permissions]);

  const selectedPermissions = form.watch("permission_ids") ?? [];
  const groupedPermissions =
    permissionsQuery.data?.reduce<Record<string, typeof permissionsQuery.data>>((groups, permission) => {
      const group = permission.module ?? "general";
      groups[group] ??= [];
      groups[group].push(permission);
      return groups;
    }, {}) ?? {};

  function togglePermission(permissionId: number) {
    const nextValues = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((currentPermission) => currentPermission !== permissionId)
      : [...selectedPermissions, permissionId];

    form.setValue("permission_ids", nextValues, { shouldDirty: true });
  }

  async function handleSubmit(values: AssignRolePermissionsInput) {
    resetBackendFormErrors();

    try {
      await assignPermissionsMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("roles.permissions_update_error_fallback"),
      });
    }
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Assign permissions</SheetTitle>
          <SheetDescription>
            Update the permission set assigned to {role.name}.
          </SheetDescription>
        </SheetHeader>

        {permissionsQuery.isLoading ? (
          <LoadingState description="Loading available permissions." />
        ) : null}
        {permissionsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              permissionsQuery.error,
              t("common.load_failed"),
            )}
            onRetry={() => permissionsQuery.refetch()}
          />
        ) : null}
        {permissionsQuery.data?.length === 0 ? (
          <EmptyState
            description="No permissions were returned by the backend."
            title="No permissions available"
          />
        ) : null}
        {permissionsQuery.data?.length ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormErrorBanner message={formError} />

            <div className="max-h-[28rem] space-y-4 pr-1">
              {Object.entries(groupedPermissions)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([group, permissions]) => (
                  <section key={group} className="space-y-3 rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold capitalize">{group}</h3>
                      <Badge variant="outline">{permissions.length} permissions</Badge>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {permissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/40"
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{permission.action ?? permission.key}</p>
                              {permission.action ? (
                                <Badge variant="outline" className="text-xs">
                                  {permission.key}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {permission.description || "No description provided."}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </section>
                ))}
            </div>

            <div className="flex justify-end">
              <ActionButton
                isLoading={assignPermissionsMutation.isPending}
                loadingText="Updating"
                type="submit"
              >
                Save permissions
              </ActionButton>
            </div>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export { AssignRolePermissionsDialog };
