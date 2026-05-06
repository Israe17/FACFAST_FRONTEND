"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/shared/components/action-button";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { useSession } from "@/shared/hooks/use-session";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { assignUserBranchesSchema } from "../schemas";
import { useAssignableBranchesQuery, useAssignUserBranchesMutation } from "../queries";
import type { AssignUserBranchesInput, User } from "../types";

type AssignUserBranchesDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: User;
};

function AssignUserBranchesDialog({
  onOpenChange,
  open,
  user,
}: AssignUserBranchesDialogProps) {
  const { activeBranchId, isBusinessLevelContext } = useActiveBranch();
  const { user: sessionUser } = useSession();
  const branchesQuery = useAssignableBranchesQuery(open);
  const assignBranchesMutation = useAssignUserBranchesMutation(user.id, {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<AssignUserBranchesInput>({
    defaultValues: {
      branch_ids: user.branch_ids,
    },
    resolver: buildFormResolver<AssignUserBranchesInput>(assignUserBranchesSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (open) {
      form.reset({
        branch_ids: user.branch_ids,
      });
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors, user.branch_ids]);

  const selectedBranchIds =
    useWatch({
      control: form.control,
      name: "branch_ids",
    }) ?? [];
  const allowedBranchIds = sessionUser?.branch_ids ?? [];
  const branches =
    branchesQuery.data?.filter(
      (branch) =>
        !allowedBranchIds.length ||
        allowedBranchIds.includes(branch.id) ||
        user.branch_ids.includes(branch.id),
    ) ?? [];

  function toggleBranch(branchId: string) {
    const nextValues = selectedBranchIds.includes(branchId)
      ? selectedBranchIds.filter((currentBranchId) => currentBranchId !== branchId)
      : [...selectedBranchIds, branchId];

    form.setValue("branch_ids", nextValues, { shouldDirty: true });
  }

  async function handleSubmit(values: AssignUserBranchesInput) {
    resetBackendFormErrors();

    try {
      await assignBranchesMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("users.branches_update_error_fallback"),
      });
    }
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("users.assign_branches_title")}</SheetTitle>
          <SheetDescription>{t("users.assign_branches_description", { name: user.name })}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {t("users.active_branch_badge", {
              branch: isBusinessLevelContext ? t("common.enterprise_level") : (activeBranchId ?? t("common.no_branch")),
            })}
          </Badge>
          <Badge variant="outline">
            {t("users.allowed_branches_badge", {
              count: allowedBranchIds.length || t("common.all"),
            })}
          </Badge>
        </div>

        {branchesQuery.isLoading ? <LoadingState description={t("users.loading_branches")} /> : null}
        {branchesQuery.isError ? (
          <ErrorState
            description={getTranslatedBackendErrorMessage(branchesQuery.error, {
              fallbackMessage: t("users.load_branches_error"),
              translateMessage: t,
            }) ?? undefined}
            onRetry={() => branchesQuery.refetch()}
          />
        ) : null}
        {branchesQuery.data?.length === 0 ? (
          <EmptyState
            description={t("users.no_branches_description")}
            title={t("users.no_branches_title")}
          />
        ) : null}
        {branches.length ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormErrorBanner message={formError} />

            <div className="max-h-80 space-y-3 rounded-xl border border-border p-4">
              {branches.map((branch) => (
                <label
                  key={branch.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/40"
                >
                  <Checkbox
                    checked={selectedBranchIds.includes(branch.id)}
                    onCheckedChange={() => toggleBranch(branch.id)}
                  />
                  <div className="space-y-1">
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {branch.id}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end">
              <ActionButton
                isLoading={assignBranchesMutation.isPending}
                loadingText={t("common.updating")}
                type="submit"
              >
                {t("users.save_branches")}
              </ActionButton>
            </div>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export { AssignUserBranchesDialog };
