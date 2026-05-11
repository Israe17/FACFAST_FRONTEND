"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      form.reset({
        role_ids: user.roles.map((role) => role.id),
      });
      resetBackendFormErrors();
      setSearch("");
    }
  }, [form, open, resetBackendFormErrors, user.roles]);

  const selectedRoleIds =
    useWatch({
      control: form.control,
      name: "role_ids",
    }) ?? [];

  const filteredRoles = useMemo(() => {
    const data = rolesQuery.data ?? [];
    const lowered = search.trim().toLowerCase();
    if (!lowered) return data;
    return data.filter(
      (role) =>
        role.name.toLowerCase().includes(lowered) ||
        (role.code?.toLowerCase().includes(lowered) ?? false) ||
        role.role_key.toLowerCase().includes(lowered),
    );
  }, [rolesQuery.data, search]);

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

  const hasRoles = (rolesQuery.data?.length ?? 0) > 0;
  const showSearchEmpty =
    hasRoles && search.trim() !== "" && filteredRoles.length === 0;

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent size="md">
        <SheetHeader>
          <SheetTitle>{t("users.assign_roles_title")}</SheetTitle>
          <SheetDescription>
            {t("users.assign_roles_description", { name: user.name })}
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          {rolesQuery.isLoading ? (
            <LoadingState description={t("users.loading_roles")} />
          ) : null}
          {rolesQuery.isError ? (
            <ErrorState
              description={
                getTranslatedBackendErrorMessage(rolesQuery.error, {
                  fallbackMessage: t("users.load_roles_error"),
                  translateMessage: t,
                }) ?? undefined
              }
              onRetry={() => rolesQuery.refetch()}
            />
          ) : null}
          {rolesQuery.data && !hasRoles ? (
            <EmptyState
              description={t("users.no_roles_description")}
              title={t("users.no_roles_title")}
            />
          ) : null}

          {hasRoles ? (
            <form
              className="space-y-3"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormErrorBanner message={formError} />

              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  aria-label={t("users.roles_search_label")}
                  className="h-9 pl-8 pr-8"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("users.roles_search_placeholder")}
                  value={search}
                />
                {search ? (
                  <button
                    type="button"
                    aria-label={t("common.clear")}
                    onClick={() => setSearch("")}
                    className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <ul className="max-h-[60vh] space-y-1 overflow-y-auto rounded-xl border border-border p-2">
                {showSearchEmpty ? (
                  <li className="px-2 py-3 text-sm text-muted-foreground">
                    {t("users.roles_search_empty")}
                  </li>
                ) : null}
                {filteredRoles.map((role) => {
                  const checked = selectedRoleIds.includes(role.id);
                  return (
                    <li key={role.id}>
                      <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted/40">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{role.name}</span>
                            {role.is_system ? (
                              <Badge
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px]"
                              >
                                {t("users.role_system_badge")}
                              </Badge>
                            ) : null}
                            {role.code ? (
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-[10px] font-mono"
                              >
                                {role.code}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {role.role_key}
                          </p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>

              <div className="flex justify-end">
                <ActionButton
                  isLoading={assignRolesMutation.isPending}
                  loadingText={t("common.updating")}
                  type="submit"
                >
                  {t("users.save_roles")}
                </ActionButton>
              </div>
            </form>
          ) : null}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export { AssignUserRolesDialog };
